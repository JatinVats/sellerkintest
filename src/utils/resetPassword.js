import { auth } from "../firebase";
import {
  onAuthStateChanged,
  sendPasswordResetEmail,
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

export async function sendResetPasswordEmailFunction(email) {
  try {
    const response = await sendPasswordResetEmail(auth, email);
    console.log("Password reset email sent successfully.");
    alert("Password reset email sent successfully.");
    return response;
  } catch (error) {
    console.error("Error sending password reset email:", error.message);
  }
}
