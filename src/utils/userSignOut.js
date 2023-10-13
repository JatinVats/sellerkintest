import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const userSignOut = () => {
  signOut(auth)
    .then(() => {
      console.log("sign out successful");
    })
    .catch((error) => console.log(error));
};

export default userSignOut;
