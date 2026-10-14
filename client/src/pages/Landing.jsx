import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '⚡', title: 'Fast ordering', text: 'Browse every canteen stall and place your meal order in just a few taps.' },
  { icon: '🔐', title: 'Secure accounts', text: 'Sign in with your email or phone number, protected by one-time password verification.' },
  { icon: '🧑‍🍳', title: 'Seller tools', text: 'Manage your shop, menu items with photos, and incoming orders from one dashboard.' },
];

const STEPS = [
  { n: '01', title: 'Create an account', text: 'Sign up with your email or phone and verify it with a one-time code.' },
  { n: '02', title: 'Pick a shop', text: 'Choose the canteen stall you want to buy from and explore its menu.' },
  { n: '03', title: 'Order & collect', text: 'Add items to your cart, place the order and pick it up when it is ready.' },
];

// Interactive 3D scene: the whole stage tilts toward the mouse pointer
function Scene3D() {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMove = (e) => {
    const rect = ref.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    setTilt({ x, y });
  };

  return (
    <div className="scene" ref={ref} onMouseMove={handleMove} onMouseLeave={() => setTilt({ x: 0, y: 0 })}>
      <div
        className="scene-stage"
        style={{ transform: `rotateX(${-tilt.y * 14}deg) rotateY(${tilt.x * 18}deg)` }}
      >
        <div className="plate">
          <div className="plate-inner">🍛</div>
        </div>
        <div className="glass orbit orbit-a">🥗<span>Fresh Salads</span></div>
        <div className="glass orbit orbit-b">🍔<span>Burgers</span></div>
        <div className="glass orbit orbit-c">☕<span>Hot Coffee</span></div>
        <div className="glass orbit orbit-d">🥘<span>Thali Combo</span></div>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <main className="page">
        <section className="hero">
          <div>
            <span className="badge-soft">✨ Smart campus canteen ordering</span>
            <h1>
              Your canteen, <span>served in glass.</span>
            </h1>
            <p className="lead">
              Browse menus from every canteen stall, order ahead, and track your food — all in a
              clean, light interface designed for students, staff and the kitchens that serve them.
            </p>
            <div className="cta-row">
              <Link to="/register" className="btn btn-primary">Get started</Link>
              <Link to="/login" className="btn btn-ghost">I already have an account</Link>
            </div>
          </div>
          <Scene3D />
        </section>

        <section className="section" id="about">
          <div className="section-head">
            <h2>About Glassify Canteen</h2>
            <p className="muted">
              Glassify Canteen connects customers with campus food stalls through a single platform.
              Customers discover shops and order instantly, while sellers run their stall, update the
              menu with photos and keep orders moving from the kitchen to the counter.
            </p>
          </div>
          <div className="grid-3">
            {FEATURES.map((f) => (
              <div className="glass feature" key={f.title}>
                <div className="icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p className="muted">{f.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="section-head">
            <h2>How it works</h2>
          </div>
          <div className="grid-3">
            {STEPS.map((s) => (
              <div className="glass feature" key={s.n}>
                <div className="step-n">{s.n}</div>
                <h3>{s.title}</h3>
                <p className="muted">{s.text}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="footer">© {new Date().getFullYear()} Glassify Canteen · Built with the MERN stack</footer>
    </>
  );
}
