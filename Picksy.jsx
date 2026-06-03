import { useState, useRef, useEffect } from "react";

const AFFILIATE_TAG = "your-tag-20"; // ← Replace with your Amazon Associates tag

function buildAmazonLink(searchQuery) {
  const encoded = encodeURIComponent(searchQuery);
  return `https://www.amazon.com/s?k=${encoded}&tag=${AFFILIATE_TAG}`;
}

function ProductCard({ product }) {
  return (
    <a
      href={buildAmazonLink(product.searchTerm)}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,215,0,0.15)",
        borderRadius: "12px",
        padding: "16px",
        textDecoration: "none",
        transition: "all 0.2s",
        cursor: "pointer",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = "rgba(255,215,0,0.08)";
        e.currentTarget.style.borderColor = "rgba(255,215,0,0.5)";
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
        e.currentTarget.style.borderColor = "rgba(255,215,0,0.15)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <span style={{ fontSize: "15px", fontWeight: "600", color: "#fff", lineHeight: 1.3, flex: 1 }}>
          {product.name}
        </span>
        <span style={{
          fontSize: "11px", fontWeight: "700", color: "#111",
          background: "#FFD700", borderRadius: "6px", padding: "2px 8px",
          marginLeft: "8px", whiteSpace: "nowrap"
        }}>
          View on Amazon →
        </span>
      </div>
      <span style={{ fontSize: "13px", color: "rgba(255,255,255,0.55)", lineHeight: 1.5 }}>
        {product.reason}
      </span>
      {product.priceRange && (
        <span style={{ fontSize: "13px", color: "#FFD700", fontWeight: "600" }}>
          {product.priceRange}
        </span>
      )}
    </a>
  );
}

function Message({ msg }) {
  if (msg.role === "user") {
    return (
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
        <div style={{
          maxWidth: "75%", background: "#FFD700", color: "#111",
          borderRadius: "18px 18px 4px 18px", padding: "12px 16px",
          fontSize: "14px", fontWeight: "500", lineHeight: 1.5
        }}>
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "flex-start" }}>
      <div style={{
        width: "32px", height: "32px", borderRadius: "50%",
        background: "linear-gradient(135deg, #FFD700, #FF8C00)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: "14px", flexShrink: 0, marginTop: "2px"
      }}>
        ✦
      </div>
      <div style={{ flex: 1, maxWidth: "85%" }}>
        {msg.text && (
          <p style={{
            fontSize: "14px", color: "rgba(255,255,255,0.85)",
            lineHeight: 1.7, margin: "0 0 12px 0"
          }}>
            {msg.text}
          </p>
        )}
        {msg.products && msg.products.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {msg.products.map((p, i) => <ProductCard key={i} product={p} />)}
          </div>
        )}
        {msg.loading && (
          <div style={{ display: "flex", gap: "6px", alignItems: "center", height: "24px" }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                width: "7px", height: "7px", borderRadius: "50%",
                background: "#FFD700", opacity: 0.6,
                animation: `bounce 1.2s ${i * 0.2}s infinite ease-in-out`
              }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const SYSTEM_PROMPT = `You are a friendly and expert shopping advisor. Your mission is to recommend specific Amazon products based on what the user needs.

ALWAYS respond in the following exact JSON format (no markdown, no backticks):
{
  "text": "Brief conversational text explaining your recommendation (1-2 sentences)",
  "products": [
    {
      "name": "Specific product name (brand + model if applicable)",
      "reason": "Why this product is ideal for the user (1 sentence)",
      "priceRange": "Estimated price range in USD, e.g. $25 – $45",
      "searchTerm": "Exact term to search for this product on Amazon"
    }
  ]
}

Recommend between 2 and 4 products. Be specific with real brands and models. If the user greets you or asks a general question, respond warmly and ask them to specify what they want to buy.`;

export default function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm your AI shopping advisor. Tell me what you need and I'll find the best options on Amazon for you. 🛒",
      products: []
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const userText = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userText }]);
    setLoading(true);

    const loadingId = Date.now();
    setMessages(prev => [...prev, { role: "assistant", loading: true, id: loadingId }]);

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.role === "user" ? m.content : (m.text || "")
      }));

      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: [...history, { role: "user", content: userText }]
        })
      });

      const data = await response.json();
      const raw = data.content?.[0]?.text || '{"text":"Sorry, something went wrong.","products":[]}';

      let parsed;
      try {
        parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch {
        parsed = { text: raw, products: [] };
      }

      setMessages(prev => prev.map(m =>
        m.id === loadingId
          ? { role: "assistant", text: parsed.text, products: parsed.products || [] }
          : m
      ));
    } catch (err) {
      setMessages(prev => prev.map(m =>
        m.id === loadingId
          ? { role: "assistant", text: "There was an error connecting to the AI. Please try again.", products: [] }
          : m
      ));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  const suggestions = ["Gaming headphones", "Ergonomic office chair", "Drawing tablet", "Electric coffee maker"];

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0a0a",
      fontFamily: "'Georgia', serif", display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px"
    }}>
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.6; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,215,0,0.2); border-radius: 4px; }
        textarea:focus { outline: none; }
        textarea { resize: none; }
      `}</style>

      <div style={{
        width: "100%", maxWidth: "680px",
        display: "flex", flexDirection: "column", height: "90vh", maxHeight: "800px",
        animation: "fadeIn 0.5s ease"
      }}>
        {/* Header */}
        <div style={{
          textAlign: "center", paddingBottom: "20px",
          borderBottom: "1px solid rgba(255,215,0,0.1)"
        }}>
          <div style={{ fontSize: "28px", marginBottom: "4px" }}>✦</div>
          <h1 style={{
            fontSize: "22px", fontWeight: "700", color: "#FFD700",
            margin: "0 0 4px 0", letterSpacing: "-0.5px"
          }}>
            AI Shopping Advisor
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.35)", margin: 0 }}>
            Personalized recommendations · Amazon links
          </p>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: "auto", padding: "20px 0",
          display: "flex", flexDirection: "column"
        }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} />)}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{
            display: "flex", gap: "6px", flexWrap: "wrap",
            marginBottom: "12px"
          }}>
            {suggestions.map(s => (
              <button key={s} onClick={() => { setInput(s); inputRef.current?.focus(); }}
                style={{
                  background: "rgba(255,215,0,0.07)", border: "1px solid rgba(255,215,0,0.2)",
                  color: "rgba(255,255,255,0.7)", borderRadius: "20px", padding: "6px 12px",
                  fontSize: "12px", cursor: "pointer", transition: "all 0.15s"
                }}
                onMouseEnter={e => { e.target.style.background = "rgba(255,215,0,0.15)"; e.target.style.color = "#fff"; }}
                onMouseLeave={e => { e.target.style.background = "rgba(255,215,0,0.07)"; e.target.style.color = "rgba(255,255,255,0.7)"; }}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{
          display: "flex", gap: "10px", alignItems: "flex-end",
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,215,0,0.2)",
          borderRadius: "16px", padding: "12px 14px"
        }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
            placeholder="What are you looking to buy today?"
            rows={1}
            style={{
              flex: 1, background: "transparent", border: "none",
              color: "#fff", fontSize: "14px", lineHeight: "1.5",
              fontFamily: "inherit", minHeight: "24px", maxHeight: "100px",
              overflowY: "auto"
            }}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            style={{
              width: "36px", height: "36px", borderRadius: "10px",
              background: loading || !input.trim() ? "rgba(255,215,0,0.2)" : "#FFD700",
              border: "none", cursor: loading || !input.trim() ? "default" : "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "16px", transition: "all 0.15s", flexShrink: 0,
              color: "#111"
            }}
          >
            ↑
          </button>
        </div>

        <p style={{
          textAlign: "center", fontSize: "10px",
          color: "rgba(255,255,255,0.2)", marginTop: "8px", margin: "8px 0 0"
        }}>
          Links include your Amazon affiliate tag
        </p>
      </div>
    </div>
  );
}
