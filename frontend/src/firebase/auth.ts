import { getAuth, Auth } from "firebase/auth";
import { app } from "./firebase";

// Only create auth instance if Firebase app exists
export const auth: Auth | null = app ? getAuth(app) : null;
