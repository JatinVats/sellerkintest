import { db } from "../firebase";
import {
  query,
  collection,
  where,
  getDocs,
  updateDoc,
  doc,
  increment,
} from "firebase/firestore";

// Function to process the service request and update credits
export async function handleCredits(uid) {
  try {
    // Step 1: Find the document with the matching uid
    const q = query(collection(db, "credits"), where("user_id", "==", uid));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.log("User profile not found.");
      return;
    }

    // We assume there's only one document matching the user_id, so we use the first one
    const userDoc = querySnapshot.docs[0];
    const currentCredits = userDoc.data().credits || 0;

    const creditLimit = userDoc.data().credit_limit || 100; // Set the credit limit as needed

    // Step 2: Check Credit Limit
    if (currentCredits >= creditLimit) {
      console.log("Sorry, you have reached the credit limit.");
      return {
        ok: false,
        message: "Sorry, you have reached the credit limit.",
      };
    }

    const docRef = doc(db, "credits", userDoc.id);

    // Step 3: Update the Credit Count Atomically
    // await userDoc.ref.update({ credits: currentCredits + 1 });

    try {
      await updateDoc(docRef, { credits: increment(1) });
      console.log("Credits updated successfully.");
      return { ok: true, message: "" };
    } catch (error) {
      console.error("Error updating document:", error);
      return { ok: false, message: `Error updating document: ${error}` };
    }
  } catch (error) {
    console.error("Error processing service request:", error);
    return {
      ok: false,
      message: `Error processing service request: ${error}`,
    };
  }
}
