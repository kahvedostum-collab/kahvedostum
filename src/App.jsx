import React, { useState, useRef, useEffect } from "react";
import "./index.css";

const initialMessages = [
  {
    id: 1,
    type: "received",
    text: "Merhaba! Kahve tercihlerimiz uyuyor, sanırım benzer tatlar seviyoruz :)",
  },
  {
    id: 2,
    type: "sent",
    text: "Merhaba Ayşe! Evet, Türk kahvesi gerçekten harika. Hangi kafeleri tercih ediyorsun?",
  },
  {
    id: 3,
    type: "received",
    text: "Özellikle tarihi mekanlardaki kafeleri seviyorum. Eski şehirde güzel bir yer biliyorum, belki bir gün gidebiliriz?",
  },
  {
    id: 4,
    type: "sent",
    text: "Bu harika bir fikir! Hafta sonu için plan yapalım mı?",
  },
];

const autoReplies = [
  "Bu konuda haklısın!",
  "Gerçekten mi? Bana daha fazla anlatır mısın?",
  "Harika bir fikir!",
  "Kahve içerken bunu konuşalım :)",
];

const preferencesData = [
  {
    id: 0,
    icon: "fas fa-coffee",
    title: "Türk Kahvesi",
    subtitle: "Geleneksel lezzet",
  },
  {
    id: 1,
    icon: "fas fa-mug-hot",
    title: "Espresso",
    subtitle: "Yoğun ve sert",
  },
  {
    id: 2,
    icon: "fas fa-coffee",
    title: "Latte",
    subtitle: "Sütlü ve yumuşak",
  },
  {
    id: 3,
    icon: "fas fa-mug-hot",
    title: "Filtre Kahve",
    subtitle: "Hafif ve aromatik",
  },
  {
    id: 4,
    icon: "fas fa-leaf",
    title: "Bitki Çayı",
    subtitle: "Kafeinsiz alternatif",
  },
];

function App() {
  const [selectedPrefs, setSelectedPrefs] = useState([0]); // Türk kahvesi seçili gelsin
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef(null);

  // Mesajlar değişince en alta scroll et
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const togglePreference = (id) => {
    setSelectedPrefs((prev) =>
      prev.includes(id) ? prev.filter((pid) => pid !== id) : [...prev, id]
    );
  };

  const toggleCamera = () => {
    setIsCameraOn((prev) => !prev);
  };

  const sendMessage = () => {
    const text = chatInput.trim();
    if (!text) return;

    const newMessage = {
      id: Date.now(),
      type: "sent",
      text,
    };

    setMessages((prev) => [...prev, newMessage]);
    setChatInput("");

    // Auto reply (kd.html'deki script'e benzer)
    setTimeout(() => {
      const randomReply =
        autoReplies[Math.floor(Math.random() * autoReplies.length)];
      const replyMessage = {
        id: Date.now() + 1,
        type: "received",
        text: randomReply,
      };
      setMessages((prev) => [...prev, replyMessage]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div>
      {/* Header */}
      <header>
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <i className="fas fa-coffee"></i>
              <span>Kahvedostum</span>
            </div>
            <nav>
              <ul>
                <li>
                  <a href="#" className="active">
                    Ana Sayfa
                  </a>
                </li>
                <li>
                  <a href="#">Nasıl Çalışır?</a>
                </li>
                <li>
                  <a href="#">Eşleşmeler</a>
                </li>
                <li>
                  <a href="#">Sohbet</a>
                </li>
                <li>
                  <a href="#">Profil</a>
                </li>
              </ul>
            </nav>
            <div className="user-actions">
              <button className="btn btn-outline">Giriş Yap</button>
              <button className="btn btn-primary">Kayıt Ol</button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Kahve Sevenler Burada Buluşuyor</h1>
            <p>
              QR kodunu okut, kahve tercihlerine göre eşleş, sohbet et ve yeni
              kahve dostlarınla buluş!
            </p>
            <div className="hero-buttons">
              <button className="btn btn-primary">Hemen Başla</button>
              <button className="btn btn-outline">Daha Fazla Bilgi</button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Neden Kahvedostum?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-qrcode"></i>
              </div>
              <h3>QR Kod ile Kolay Katılım</h3>
              <p>
                Kafedeki QR kodu okutarak kolayca havuza katıl ve eşleşmeye
                başla.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Kahve Tercihlerine Göre Eşleş</h3>
              <p>
                Benzer kahve zevklerine sahip insanlarla eşleşerek ortak bir
                başlangıç noktası bul.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">
                <i className="fas fa-comments"></i>
              </div>
              <h3>Güvenli Sohbet</h3>
              <p>
                Eşleştiğin kişilerle uygulama üzerinden güvenli bir şekilde
                sohbet et.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="container">
          <h2 className="section-title">Nasıl Çalışır?</h2>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-icon">
                <i className="fas fa-map-marker-alt"></i>
              </div>
              <h3>Kafeye Git</h3>
              <p>Anlaşmalı kafelerden birini ziyaret et.</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-icon">
                <i className="fas fa-qrcode"></i>
              </div>
              <h3>QR Kodu Okut</h3>
              <p>Kafedeki QR kodunu uygulama ile okutarak havuza katıl.</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-icon">
                <i className="fas fa-user-friends"></i>
              </div>
              <h3>Eşleş</h3>
              <p>Kahve tercihlerine göre seninle eşleşen kişileri gör.</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-icon">
                <i className="fas fa-comment-dots"></i>
              </div>
              <h3>Sohbet Et</h3>
              <p>Eşleştiğin kişilerle sohbet et ve buluşma planı yap.</p>
            </div>
          </div>
        </div>
      </section>

      {/* QR Scanner */}
      <section className="qr-scanner">
        <div className="container">
          <h2 className="section-title">QR Kodunu Okut</h2>
          <div className="scanner-container">
            <div className="scanner-placeholder">
              <i
                className={isCameraOn ? "fas fa-camera" : "fas fa-qrcode"}
              ></i>
            </div>
            <p>
              Kafedeki QR kodu bu alana okutarak havuza katılabilirsin.
            </p>
            <button
              className="btn btn-primary"
              style={{ marginTop: 20 }}
              onClick={toggleCamera}
            >
              {isCameraOn ? "Kamerayı Kapat" : "Kamera Aç"}
            </button>
          </div>
        </div>
      </section>

      {/* Coffee Preferences */}
      <section className="preferences">
        <div className="container">
          <h2 className="section-title">Kahve Tercihlerin</h2>
          <p
            style={{
              textAlign: "center",
              maxWidth: 700,
              margin: "0 auto 30px",
            }}
          >
            Tercihlerini belirleyerek benzer zevklere sahip kişilerle
            eşleşebilirsin.
          </p>
          <div className="preferences-grid">
            {preferencesData.map((pref) => (
              <div
                key={pref.id}
                className={
                  "preference-card" +
                  (selectedPrefs.includes(pref.id) ? " selected" : "")
                }
                onClick={() => togglePreference(pref.id)}
              >
                <div className="preference-icon">
                  <i className={pref.icon}></i>
                </div>
                <h3>{pref.title}</h3>
                <p>{pref.subtitle}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Matches */}
      <section className="matches">
        <div className="container">
          <h2 className="section-title">Potansiyel Eşleşmeler</h2>
          <div className="matches-container">
            <div className="match-card">
              <div className="match-image">
                <i className="fas fa-user"></i>
              </div>
              <div className="match-info">
                <h3 className="match-name">Ayşe</h3>
                <div className="match-details">
                  <span>
                    <i className="fas fa-coffee"></i> Türk Kahvesi
                  </span>
                  <span>
                    <i className="fas fa-map-marker-alt"></i> 1.2 km
                  </span>
                </div>
                <p>Kahve sohbetlerini seven, kitap kurdu birisi.</p>
                <div className="match-actions">
                  <button className="btn btn-primary btn-small">
                    Sohbet Et
                  </button>
                  <button className="btn btn-outline btn-small">
                    Profili Gör
                  </button>
                </div>
              </div>
            </div>

            <div className="match-card">
              <div className="match-image">
                <i className="fas fa-user"></i>
              </div>
              <div className="match-info">
                <h3 className="match-name">Mehmet</h3>
                <div className="match-details">
                  <span>
                    <i className="fas fa-coffee"></i> Espresso
                  </span>
                  <span>
                    <i className="fas fa-map-marker-alt"></i> 0.8 km
                  </span>
                </div>
                <p>Yeni kahve çeşitlerini denemeyi seven bir girişimci.</p>
                <div className="match-actions">
                  <button className="btn btn-primary btn-small">
                    Sohbet Et
                  </button>
                  <button className="btn btn-outline btn-small">
                    Profili Gör
                  </button>
                </div>
              </div>
            </div>

            <div className="match-card">
              <div className="match-image">
                <i className="fas fa-user"></i>
              </div>
              <div className="match-info">
                <h3 className="match-name">Zeynep</h3>
                <div className="match-details">
                  <span>
                    <i className="fas fa-coffee"></i> Latte
                  </span>
                  <span>
                    <i className="fas fa-map-marker-alt"></i> 2.1 km
                  </span>
                </div>
                <p>
                  Sanat ve fotoğrafçılıkla ilgileniyor, sakin ortamları seviyor.
                </p>
                <div className="match-actions">
                  <button className="btn btn-primary btn-small">
                    Sohbet Et
                  </button>
                  <button className="btn btn-outline btn-small">
                    Profili Gör
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Section */}
      <section className="chat-section">
        <div className="container">
          <h2 className="section-title">Sohbet Et</h2>
          <div className="chat-container">
            <div className="chat-header">
              <div className="chat-user-avatar">
                <i className="fas fa-user"></i>
              </div>
              <div>
                <h3>Ayşe</h3>
                <p>Çevrimiçi</p>
              </div>
            </div>
            <div className="chat-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={
                    "message " +
                    (msg.type === "sent" ? "sent" : "received")
                  }
                >
                  {msg.text}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="Mesajınızı yazın..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button onClick={sendMessage}>
                <i className="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container">
          <div className="footer-content">
            <div className="footer-column">
              <h3>Kahvedostum</h3>
              <p>
                Kahve sevenleri bir araya getiren sosyal buluşma platformu.
              </p>
              <div className="social-links">
                <a href="#">
                  <i className="fab fa-facebook-f"></i>
                </a>
                <a href="#">
                  <i className="fab fa-twitter"></i>
                </a>
                <a href="#">
                  <i className="fab fa-instagram"></i>
                </a>
                <a href="#">
                  <i className="fab fa-linkedin-in"></i>
                </a>
              </div>
            </div>
            <div className="footer-column">
              <h3>Bağlantılar</h3>
              <ul>
                <li>
                  <a href="#">Ana Sayfa</a>
                </li>
                <li>
                  <a href="#">Nasıl Çalışır?</a>
                </li>
                <li>
                  <a href="#">Eşleşmeler</a>
                </li>
                <li>
                  <a href="#">Sohbet</a>
                </li>
                <li>
                  <a href="#">Profil</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>Yardım</h3>
              <ul>
                <li>
                  <a href="#">SSS</a>
                </li>
                <li>
                  <a href="#">Gizlilik Politikası</a>
                </li>
                <li>
                  <a href="#">Kullanım Koşulları</a>
                </li>
                <li>
                  <a href="#">İletişim</a>
                </li>
              </ul>
            </div>
            <div className="footer-column">
              <h3>İndir</h3>
              <p>
                Uygulamayı hemen indir ve kahve dostlarınla buluşmaya başla!
              </p>
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 15,
                }}
              >
                <button className="btn btn-primary">App Store</button>
                <button className="btn btn-primary">Google Play</button>
              </div>
            </div>
          </div>
          <div className="copyright">
            <p>&copy; 2023 Kahvedostum. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
