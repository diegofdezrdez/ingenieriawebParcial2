import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User
} from "firebase/auth";

import { auth, googleProvider, githubProvider } from "../services/firebase";

import {
  crearUsuario,
  modificarUsuario,
} from "../services/servicesParcial2"; 

import { UsuarioCrear } from "../esquemas/esquemas";


// =====================================================

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);


export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);


  // ==========================================================
  //   Sincronizar usuario con FastAPI
  // ==========================================================
  const sincronizarUsuarioConBackend = async (firebaseUser: User) => {
    if (!firebaseUser.email) return;

    const userData: UsuarioCrear = {
      _id: firebaseUser.uid,
      email: firebaseUser.email,
      alias: firebaseUser.displayName || "Usuario",
      foto: firebaseUser.photoURL,
      fechaLogueo: new Date().toISOString(),
      fechaCaducidad: new Date(Date.now() + 3600 * 1000).toISOString()
    };

    try {
      // Intentar CREAR usuario
      const creado = await crearUsuario(userData);

      if (creado) {
        console.log("Usuario creado en backend");
        return;
      }

      console.warn("Backend devolvió null, se intenta actualizar...");

    } catch (err) {
      console.warn("Posible usuario existente, actualizando...");
    }

    // Si crear falla, intentamos actualizar
    await modificarUsuario(firebaseUser.uid, {
      alias: userData.alias,
      foto: userData.foto,
      fechaCaducidad: userData.fechaCaducidad
    });

    console.log("Usuario actualizado en backend");
  };


  // ==========================================================
  //   LOGIN GOOGLE
  // ==========================================================
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        await sincronizarUsuarioConBackend(result.user);
        localStorage.setItem("logueado", "true");
      }
    } catch (err) {
      console.error("Error en login Google:", err);
    }
  };


  // ==========================================================
  //   LOGIN GITHUB
  // ==========================================================
  const signInWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      if (result.user) {
        await sincronizarUsuarioConBackend(result.user);
        localStorage.setItem("logueado", "true");
      }
    } catch (err) {
      console.error("Error en login GitHub:", err);
    }
  };


  // ==========================================================
  //   LOGOUT
  // ==========================================================
  const logOut = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("logueado");
    } catch (err) {
      console.error("Error logout:", err);
    }
  };


  // ==========================================================
  //   OBSERVER AUTH
  // ==========================================================
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);

      if (currentUser) {
        await sincronizarUsuarioConBackend(currentUser);
      }
    });

    return () => unsub();
  }, []);


  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithGoogle,
        signInWithGithub,
        logOut
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};


export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de un AuthProvider");
  return ctx;
};
