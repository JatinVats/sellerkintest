import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";
import { sendResetPasswordEmailFunction } from "../utils/resetPassword";

const ForgotPassword = () => {
  //   const auth = getAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authUser, setAuthUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const listen = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      }
    });

    return () => {
      listen();
    };
  }, []);

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        // console.log(userCredential.user?.email);
        alert(`logged in as ${userCredential.user?.email}`);
        console.log(userCredential);
        navigate("/dashboard");
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className="signup-body">
      {authUser && (
        <Link to="/" id="home-link">
          Home
        </Link>
      )}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          sendResetPasswordEmailFunction(email);
        }}
      >
        <h2>Forgot Password</h2>
        <p>Verify your email before resetting Sellerkin password</p>
        <label for="username">Email</label>
        <input
          onChange={handleEmailChange}
          value={email}
          type="text"
          placeholder="Enter your Email"
          id="username"
        />
        <button>Send Password Reset mail</button>
        <div className="signup-option">
          or <Link to="/signin">Login</Link>
        </div>
      </form>
    </div>
  );
};

export default ForgotPassword;
