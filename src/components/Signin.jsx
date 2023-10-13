import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/login.css";
import { auth } from "../firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { Link } from "react-router-dom";

const Signin = () => {
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
      <form onSubmit={handleSignIn}>
        <h2>Log in to Sellerkin</h2>
        <p>Welcome back! Please Enter your details to proceed. </p>
        <label for="username">Email</label>
        <input
          onChange={handleEmailChange}
          value={email}
          type="text"
          placeholder="Enter your Email"
          id="username"
        />
        <label for="password">Password</label>
        <input
          onChange={handlePasswordChange}
          value={password}
          type="password"
          placeholder="Enter your Password"
          id="password"
        />
        <Link to="/forgotpassword" id="forgot-password-link">
          Forgot password
        </Link>
        <button>Log In</button>
        <div className="signup-option">
          or <Link to="/signup">Create an account</Link>
        </div>
        {/* <div class="social">
          <div class="go">
            <i class="fab fa-google"></i> Google
          </div>
          <div class="fb">
            <i class="fab fa-facebook"></i> Facebook
          </div>
        </div> */}
      </form>
    </div>
  );
};

export default Signin;
