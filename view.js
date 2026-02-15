import { initializeApp } from "https://www.gstatic.com/firebasejs/12.8.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut} from "https://www.gstatic.com/firebasejs/12.8.0/firebase-auth.js"
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

let selectedDocId = null;

function deleteDoc(docId) {
  // TODO : si l'user n'est pas le propriétaire du document, il faut juste le retirer de sa liste de documents partagés, sinon il faut supprimer le document et le retirer de la liste de tous les utilisateurs avec qui il est partagé
  let updates = {};
  updates["Documents/" + docId] = null;
  updates["Users/" + auth.currentUser.uid + "/Docs/" + docId] = null;
  update(dbRef, updates).then( () => {
    window.location.reload();  // On recharge la page pour mettre à jour la liste des documents
  });
}

function renameDoc(docId, newName) {
  // TODO : modifier aussi le nom du document dans les autres utilisateurs avec qui le document est partagé
  let updates = {};
  updates["Documents/" + docId + "/name"] = newName;
  updates["Users/" + auth.currentUser.uid + "/Docs/" + docId] = newName;
  update(dbRef, updates).then( () => {
    window.location.reload();  // On recharge la page pour mettre à jour la liste des documents
  });
}

function shareDoc(docId, email) {
    // TODO : partager le document avec un autre utilisateur grâce à son email : ajouter l'user dans la liste des utilisateurs avec qui le document est partagé dans la database, et ajouter le document dans la liste des documents partagés de l'utilisateur
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si l'utilisateur est connecté (grâce au cookies)
    const uid = user.uid;

    Promise.all([
      get(child(dbRef, `Users/${uid}/Docs`)),
      get(child(dbRef, `Users/${uid}/DocsShared`))
    ]).then(([docsSnap, sharedSnap]) => {

      let documents = {};

      if (docsSnap.exists()) {
        documents = { ...documents, ...docsSnap.val() };
      }

      if (sharedSnap.exists()) {
        documents = { ...documents, ...sharedSnap.val() };
      }

      if (Object.keys(documents).length > 0) {
        console.log("Documents récupérés !");

        const div = document.getElementById("documents")
        for (let el in documents) {
          const doc = document.createElement("div"); //Crée un objet html p
          doc.className = "document";

          const img = document.createElement("img");
          img.src = "./image/miniatureFile.png";
          img.className = "img_file";
          doc.appendChild(img);

          const name = document.createElement("p");
          name.innerHTML = documents[el];
          doc.appendChild(name);

          const btnMenu = document.createElement("img");
          btnMenu.src = "./image/btn-menu.png";
          btnMenu.className = "btn_menu";
          doc.appendChild(btnMenu);

          doc.addEventListener("click", function (e) { // Quand le document est cliqué
            if (e.target.closest(".btn_menu")) { // Si c'est le bouton menu qui est cliqué
              // Afficher le menu de gestion du document (ex: renommer, supprimer, partager, etc.)
              const menu = document.getElementById("document_menu");
              menu.style.display = "flex";
              menu.style.left = e.clientX + "px";
              menu.style.top = e.clientY + "px";
              selectedDocId = el; // Stocke l'uid du document sélectionné pour le menu
            } else { // Sinon, c'est que le document lui même est cliqué
              // On stocke l'uid du document à modifier dans la database
              let updates = {};
              updates["Users/" + uid + "/liveDoc"] = el;   
              update(dbRef, updates).then(() => {
                window.location.href = "./write.html";  // On le redirige vers la page write
              });
            }
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


//deconexion
const log_out = document.getElementById("log_out");

log_out.addEventListener("click", function() {
  signOut(auth).then(() => {
    window.location.url = index.html
  }).catch((error) => {
    console.log("Erreure lors de la deconexion")
  });
})

// Fermer le menu de gestion du document si on clique en dehors
document.addEventListener("click", function (e) {
  const menu = document.getElementById("document_menu");
  // Si le menu est visible
  if (menu.style.display === "flex") {

    // Si on clique ni sur le menu ni sur un bouton menu
    if (!e.target.closest("#document_menu") && !e.target.closest(".btn_menu")) {
      menu.style.display = "none";
    }
  }
});

// Gérer les actions du menu de gestion du document
document.getElementById("btn_rename").addEventListener("click", function () {
  const newName = prompt("Entrez le nouveau nom du document :");
  if (newName) {
    renameDoc(selectedDocId, newName);
  } else {
    alert("Le nom ne peut pas être vide !");
  }
});

document.getElementById("btn_delete").addEventListener("click", function () {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
    deleteDoc(selectedDocId);
  }
});
