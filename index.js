// Lien doc firebase : https://firebase.google.com/docs/auth/web/password-auth?hl=fr

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged,} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js"

// Configuration de l'application
const firebaseConfig = {
    apiKey: "AIzaSyC13pdaQQ8zhSq7g8P0fwMcFt3hQvgJWKI",
    authDomain: "doc-online-6e30f.firebaseapp.com",
    projectId: "doc-online-6e30f",
    storageBucket: "doc-online-6e30f.firebasestorage.app",
    messagingSenderId: "386043933804",
    appId: "1:386043933804:web:744186168ef93e9a359449"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Vérifie si l'utilisateur est connecté grace au cookies
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si l'utilisateur est connecté (grâce au cookies)
    window.location.href = "./view.html";   // On le redirige vers la page view
    console.log("Utilisateur déjà connecté !")
  };
});

const btn_log_in = document.getElementById("btn_log_in"); // prend le bouton log in
btn_log_in.addEventListener("click", function () {  //Quand le bouton est cliqué alors faire...
  const email = document.getElementById("input_email").value;  //recupere les données entrées
  const password = document.getElementById("input_password").value;  //recupere les données entrées

  signInWithEmailAndPassword(auth, email, password) //Se connecte avec les données fournies
      .then((userCredential) => {
        // Si l'authentification a réussi
        window.location.href = "./view.html";   // On le redirige vers la page view
      })
      .catch((error) => { // Erreur de connexion
        const errorCode = error.code;
        const errorMessage = error.message;
        console.log(errorCode, errorMessage)
      });
});