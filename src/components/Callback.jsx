import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase";
import {
  getFirestore,
  addDoc,
  collection,
  arrayUnion,
  query,
  where,
  getDoc,
  updateDoc,
  doc,
  getDocs,
} from "firebase/firestore";

const Callback = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  // console.log(code, state);
  const navigate = useNavigate();

  const uploadTokens = async (access_token, refresh_token) => {
    try {
      // const docref = doc(db, "tokens", eventID);
      // const data = await getDoc(docref);
      const listen = onAuthStateChanged(auth, async (user) => {
        if (user) {
          // setAuthUser(null);
          console.log(user);
          const docRef = await addDoc(collection(db, "tokens"), {
            user_id: user.uid,
            access_token: access_token,
            refresh_token: refresh_token,
          });
          console.log("Document updated with ID: ", docRef.id);
        }
      });
    } catch (e) {
      console.error("Error adding document: ", e);
    }
  };

  useEffect(() => {
    fetch(`/application/callback?code=${code}&state=${state}`)
      .then((response) => response.json())
      .then((data) => {
        const body1 = JSON.parse(data.body);
        // console.log("frontend 1:", body1);
        // if (body1.refresh_token) {
        fetch("/application/getrefreshtoken", {
          method: "post",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refresh_token: body1.refresh_token,
          }),
        })
          .then((response) => response.json())
          .then((data) => {
            const body2 = JSON.parse(data.body);
            // console.log("frontend 2:", body2);
            if (body2.access_token) {
              uploadTokens(body2.access_token, body2.refresh_token);
              navigate("/dashboard");
            }
          })
          .catch((error) => {
            console.error("Error:", error);
          });
        // }
        // console.log(JSON.parse(data.body).results[0]);
      })
      .catch((error) => {
        console.error("Error:", error);
      });
  }, [code, state]);

  return (
    <div className="callback-body">
      Please wait. You'll be redirected to Sellerkin once done.
    </div>
  );
};

export default Callback;
