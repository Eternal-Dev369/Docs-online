import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged,} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js"
import { getDatabase, get, onValue, ref, update, child } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

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
const auth = getAuth(app)
const db = getDatabase(app);

// Fonction pour ajuster la hauteur
function adjustHeight(el) {
    el.style.height = "70vh";           // remet la hauteur minimale
    el.style.height = el.scrollHeight + "px"; // ajuste à la taille du contenu
}

const areaWrite = document.getElementById("zone_de_texte")
const docName = document.getElementById("doc_name")

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si l'utilisateur est connecté (grâce au cookies)
    const uid = user.uid

    get(child(ref(db), `Users/${uid}/liveDoc`)).then((snapshot) => {
      if (snapshot.exists()) {
        const id_doc = snapshot.val()

        onValue(ref(db, 'Documents/' + id_doc), (data) => {
          const infoDoc = data.val();
          docName.innerHTML = infoDoc.name
          areaWrite.value = infoDoc.content
          adjustHeight(textarea);    //ajustement initial de la taille du texte
        });

        areaWrite.addEventListener("input", function () {
          adjustHeight(textarea)    //ajuste la taille à chaque saisie
          update(ref(db, "Documents/" + id_doc), {
            content: areaWrite.value
          })
        })
      } else {
        alert("Problème lors de l'ouverture du document !")
      }
    }).catch((error) => {
      alert("Erreur :" + error)
    })
  } else {
    // Si l'utilisateur n'est pas connecté
    window.location.href = "./index.html";    // On le redirige vers la page index
  }

});
