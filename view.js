import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged,} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js"
import { getDatabase, ref, get, child, update } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-database.js";

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
const db = getDatabase(app);
const dbRef = ref(db);


onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si l'utilisateur est connecté (grâce au cookies)
    const uid = user.uid;

    get(child(dbRef, `Users/${uid}/Docs`)).then((snapshot) => {
      if (snapshot.exists()) {
        console.log("Documents récupérés !");
        const documents = snapshot.val();

        const div = document.getElementById("documents")
        for (let el in documents) {
          const doc = document.createElement("p"); //Crée un objet html p
          doc.innerHTML = documents[el];
          doc.className = "document";

          doc.addEventListener("click", function () { // Quand le document est cliqué
            // On stocke l'uid du document à modifier dans la database
            let updates = {};
            updates["Users/" + uid + "/liveDoc"] = el;   
            update(dbRef, updates).then(() => {
              window.location.href = "./write.html";  // On le redirige vers la page write
            });
          });

          div.appendChild(doc);  // Ajoute l'objet au document
        };

      } else {
        console.log("No data available"); // Aucun document trouvé

        const doc = document.createElement("p") //Crée un objet html p
        doc.innerHTML =   "Aucun document trouvé";

        const div = document.getElementById("documents")
        div.appendChild(doc);  // Ajoute l'objet au document
      }
    }).catch((error) => { // Erreur lors de la récupération des documents
      console.error(error);
    });

  } else {
    // Si l'utilisateur n'est pas connecté
    window.location.href = "./index.html";  // On le redirige vers la page index
  }
});

const btnNew = document.getElementById("btn_new");
const dialogNewDoc = document.getElementById("dialog_new_doc");
const btnCreate = document.getElementById("btn_create");
const inputName = document.getElementById("input_name");

btnNew.addEventListener("click", function () {
  dialogNewDoc.showModal();
})

btnCreate.addEventListener("click", function () {
  const name = inputName.value;

  if (name) {
    const idDoc =
      Date.now().toString(36) +
      Math.random().toString(36).substring(2, 10);


    let updatesDoc = {};
    updatesDoc["Documents/" + idDoc] = {name: name, userId: auth.currentUser.uid, content: "New doc"};
    update(dbRef, updatesDoc).then( () => {

      let updatesUser = {};
      updatesUser["Users/" + auth.currentUser.uid + "/Docs/" + idDoc] = name;
      update(dbRef, updatesUser).then(() => {
        dialogNewDoc.close();

        let updatesLive = {};
        updatesLive["Users/" + auth.currentUser.uid + "/liveDoc"] = idDoc;
        console.log(updatesLive);
        update(dbRef, updatesLive).then(() => {
          window.location.href = "./write.html";
        })
      })
    })
  } else {
    alert("Veuillez donner un nom au document");
  };
});

document.getElementById("btn_back").addEventListener("click", function () {
    dialogNewDoc.close()
});
