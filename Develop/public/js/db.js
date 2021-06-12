let db;
const request = indexDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore("budget-entry", { autoincrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.online) {
        uploadBudget();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveBudget(entry) {
    const transaction = db.transaction(['budget-entry'], 'readwrite');
    const budgetStore = transaction.objectStore('budget-entry');
    budgetStore.add(entry);
}
function uploadBudget() {
    const transaction = db.transaction(['budget-entry'], 'readwrite');
    const budgetStore = transaction.objectStore('budget-entry');
    const getBudgetEntries = budgetStore.getAll();
    getBudgetEntries.onsuccess = function () {
        if (getBudgetEntries.result.legnth > 0) {
            fetch('/api/transacton', {
                method: 'POST',
                body: JSON.stringify(getBudgetEntries.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'content-type': 'application/json'
                }
            })
                .then(response => response.json())
                .then(serverResponse => {
                    if (serverResponse.message) {
                        throw new Error(serverResponse);
                    }
                    const transaction = db.transaction(['budget-entry'], 'readwrite');
                    const budgetStore = transaction.objectStore('budget-entry');
                    budgetStore.clear();
                })
                .catch(err => {
                    console.log(err);
                });

        }
    };
}

window.addEventListener('online', uploadBudget);                    