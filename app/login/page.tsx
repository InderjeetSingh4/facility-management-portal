import LoginForm from './login-form'
import './login.css'

export default function LoginPage() {
  return (
    <div className="login-light-override login-root">
      {/* Full-bleed background image covering entire viewport */}
      <div
        className="login-bg"
        style={{
          backgroundImage: 'url(/login-bg.jpg)',
        }}
      />

      {/* Global soft white overlay to soften the image */}
      <div className="login-overlay" />

      {/* Left-side white fog for text legibility — fades out before the glass card */}
      <div className="login-hero-fog" />

      {/* 50/50 transparent grid sitting on top of the image */}
      <div className="login-grid">
        {/* ─── LEFT COLUMN — Hero text (transparent) ─── */}
        <div className="login-hero">
          <div className="login-hero-content">
            <p className="login-brand">FacilityOS</p>
            <h1 className="login-title">
              Manage Your<br />Facility,<br />Effortlessly.
            </h1>
            <p className="login-desc">
              Register to access all the features of our service.
              Manage your business in one place.
            </p>
          </div>
        </div>

        {/* ─── RIGHT COLUMN — True glassmorphism card (transparent) ─── */}
        <div className="login-form-col">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
