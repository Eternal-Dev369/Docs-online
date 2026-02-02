import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js"
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

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
const db = getDatabase(app)

/*
// Vérifie si l'utilisateur est connecté grace au cookies
onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si l'utilisateur est connecté (grâce au cookies)
    console.log("Utilisateur déjà connecté !")
    window.location.href = "./view.html";   // On le redirige vers la page view
  };
});
*/

const btn_create_account = document.getElementById("btn_create_account"); // prend le bouton create account
btn_create_account.addEventListener("click", function () {  // Quand le bouton est cliqué alors faire...
  const email = document.getElementById("input_email").value;  // recupere les données entrées
  const password = document.getElementById("input_password").value;  // recupere les données entrées

  // Initrialisation de l'utilisateur dans la base de donnée
  createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      // Compte créé, utilisateur connecté
      console.log("Utilisateur créer avec succès !")
      set(ref(db, 'Users/' + userCredential.user.uid), {
        liveDoc: "menu",
      }).then(() => {
        window.location.href = "./view.html";   // On le redirige vers la page view
      })
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log(errorCode, errorMessage)
    });
});