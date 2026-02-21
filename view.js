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
let selectedDocIsShared = null;
let selectedDocName = null;

function createDocumentsList(listDocs, isShared) {
  let div
  if (isShared) {
    div = document.getElementById("shared_documents")
  } else {
    div = document.getElementById("own_documents")
  }

  for (let el in listDocs) {
    const doc = document.createElement("div"); // Crée un objet html p
    doc.className = "document";

    const img = document.createElement("img");
    img.src = "./image/miniatureFile.png";
    img.className = "img_file";
    doc.appendChild(img);

    const name = document.createElement("p");
    name.innerHTML = listDocs[el];
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
        selectedDocIsShared = isShared
        selectedDocName = listDocs[el]

      } else { // Sinon, c'est que le document lui même est cliqué
        // On stocke l'uid du document à modifier dans la database
        let updates = {};
        updates["Users/" + auth.currentUser.uid + "/liveDoc"] = el;   
        update(dbRef, updates).then(() => {
          window.location.href = "./write.html";  // On le redirige vers la page write
        });
      }
    });

    div.appendChild(doc);  // Ajoute l'objet au document
  };
}

function deleteDoc(docId, isShared = false) {
  let updates = {};

  if (isShared) {
    updates["Users/" + auth.currentUser.uid + "/DocsShared/" + docId] = null;   // Si l'utilisateur n'est pas propriétaire, supprime seulement le doc de la liste des docs partagés
    updates["Documents/" + docId + "/usersShared/" + auth.currentUser.uid] = null;
    update(dbRef, updates).then(() => {
      window.location.reload()
    }).catch((error) => {
      alert("Erreur lors de la supression du document")
      console.log(error)
    })
  
  } else {
    // Suppression du document chez les utilisateurs partagés
    get(child(dbRef, "Documents/" + docId + "/usersShared")).then((snapshot) => {
      if (snapshot.exists()) {
        const usersShared = snapshot.val();
        for (let userId in usersShared) {
          updates["Users/" + userId + "/DocsShared/" + docId] = null
        }
      }

      //Supprime le document propriétaire
      updates["Documents/" + docId] = null;
      updates["Users/" + auth.currentUser.uid + "/Docs/" + docId] = null;

      update(dbRef, updates).then( () => {
        window.location.reload();  // On recharge la page pour mettre à jour la liste des documents
      });

    }).catch((error) => {
      alert("Erreur lors de la suppression du fichier des utilisateurs partagés")
      console.log(error)
    })
  }
}

function renameDoc(docId, newName) {
  let updates = {};

  // Renomme le fichier pour les utilisateurs partagés
  get(child(dbRef, "Documents/" + docId + "/usersShared")).then((snapshot) => {
    console.log(snapshot.val())
    if (snapshot.exists()) {
      const usersShared = snapshot.val();
      for (let userId in usersShared) {
        updates["Users/" + userId + "/DocsShared/" + docId] = newName
      }
    }
    
    updates["Documents/" + docId + "/name"] = newName;
    updates["Users/" + auth.currentUser.uid + "/Docs/" + docId] = newName;

    update(dbRef, updates).then( () => {
      window.location.reload();  // On recharge la page pour mettre à jour la liste des documents
    });
  }).catch((error) => {
    alert("Erreur lors du renommage du fichier des utilisateurs partagés")
    console.log(error)
  });
}

function shareDoc(docId, email, nameDoc) {
  const safeEmail = email.replace(/\./g, "_");

  get(child(dbRef, "Emails/" + safeEmail)).then((snapshot) => {
    if (snapshot.exists()) {
      const idShared = snapshot.val();

      let updates = {};
      updates["Documents/" + docId + "/usersShared/" + idShared] = true;
      updates["Users/" + idShared + "/DocsShared/" + docId] = nameDoc;

      update(dbRef, updates).catch((error) => {
        alert("Erreur lors du partage")
        console.log(error)
      })
    } else {
      alert("Utilisateur introuvable");
    }
  }).catch((error) => {
    alert("Problème lors du partage")
    console.log(error)
  })
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    // Si l'utilisateur est connecté (grâce au cookies)
    const uid = user.uid;

    Promise.all([
      get(child(dbRef, `Users/${uid}/Docs`)),
      get(child(dbRef, `Users/${uid}/DocsShared`))
    ]).then(([docsSnap, sharedSnap]) => {

      if (docsSnap.exists()) {
        createDocumentsList(docsSnap.val(), false)
      }

      if (sharedSnap.exists()) {
        createDocumentsList(sharedSnap.val(), true);
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
  if (selectedDocIsShared) {
    alert("Vous ne pouvez renommer que les documents dont vous êtes le propriétaire")
    return
  }

  const newName = prompt("Entrez le nouveau nom du document :");
  if (newName) {
    renameDoc(selectedDocId, newName);
  } else {
    alert("Le nom ne peut pas être vide !");
  }
});

document.getElementById("btn_delete").addEventListener("click", function () {
  if (confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
    deleteDoc(selectedDocId, selectedDocIsShared);
  };
});

document.getElementById("btn_share").addEventListener("click", function () {
  if (selectedDocIsShared) {
    alert("Vous ne pouvez pas partagé un document dont vous n'êtes pas le propriétaire.");
  } else {
    document.getElementById("dialog_email_user_shared").showModal();
  };
});

document.getElementById("btn_email_user_shared").addEventListener("click", function () {
  const email = document.getElementById("input_email_user_shared").value;
  if (email) {
    shareDoc(selectedDocId, email, selectedDocName);
    document.getElementById("dialog_email_user_shared").close()
  } else {
    alert("Veuillez entrer une adresse email.");
  };
});
