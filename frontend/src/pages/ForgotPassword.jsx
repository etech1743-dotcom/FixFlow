
import { useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import "./Login/login.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();

    setMessage("");
    setMessageType("");
    setLoading(true);

    try {
      const data = await api.forgotPassword({
        email: email.trim().toLowerCase(),
      });

      setMessage(
        data.message ||
          "Password reset link has been sent to your registered email."
      );
      setMessageType("success");
    } catch (error) {
      setMessage(
        error.message || "Unable to process your request. Please try again."
      );
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-right" style={{ width: "100%" }}>
        <div className="login-card">
          <h2>Reset password</h2>

          <p>
            Enter your registered email to receive a password reset link.
          </p>

          <form onSubmit={submit}>
            <div className="input-group">
              <label htmlFor="email">Email</label>

              <div className="input-box">
                <input
                  id="email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setMessage("");
                    setMessageType("");
                  }}
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </form>

          {message && (
            <p
              className="login-message"
              role="status"
              style={{
                color:
                  messageType === "success" ? "green" : "crimson",
              }}
            >
              {message}
            </p>
          )}

          <p className="register-text">
            <Link to="/">Back to login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

// import { useState } from "react";
// import { Link } from "react-router-dom";
// import { api } from "../services/api";
// import "./Login/login.css";

// export default function ForgotPassword() {
//   const [email, setEmail] = useState("");
//   const [message, setMessage] = useState("");

//   const submit = async (e) => {
//     e.preventDefault();
//     try {
//       const data = await api.forgotPassword({ email });
//       setMessage(data.message);
//     } catch (error) {
//       setMessage(error.message);
//     }
//   };

//   return (
//     <div className="login-page">
//       <div className="login-right" style={{ width: "100%" }}>
//         <div className="login-card">
//           <h2>Reset password</h2>
//           <p>Enter your account email. In development the reset token is logged on the server.</p>
//           <form onSubmit={submit}>
//             <div className="input-group">
//               <label>Email</label>
//               <div className="input-box">
//                 <input
//                   type="email"
//                   value={email}
//                   onChange={(e) => setEmail(e.target.value)}
//                   required
//                 />
//               </div>
//             </div>
//             <button className="login-button" type="submit">
//               Send reset
//             </button>
//           </form>
//           {message && <p className="login-message">{message}</p>}
//           <p className="register-text">
//             <Link to="/">Back to login</Link>
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
