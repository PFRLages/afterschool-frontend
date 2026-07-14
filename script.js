// Base URL of the Express API (will be changed to the live URL when deployed)
const apiUrl = "http://localhost:3000";

new Vue({
    el: "#app",

    data: {
        apiUrl: apiUrl,
        lessons: [],        // all lessons fetched from the backend
        sortBy: "topic",    // attribute currently used for sorting
        sortOrder: "asc"    // ascending or descending
    },

    // Runs when the page loads: fetch the lessons from the API
    created: function () {
        fetch(apiUrl + "/lessons")
            .then(function (response) {
                return response.json();
            })
            .then((data) => {
                this.lessons = data;
            })
            .catch(function (err) {
                console.error("Failed to load lessons:", err);
            });
    },

    computed: {
        // Returns the lessons sorted by the selected attribute and order
        sortedLessons: function () {
            const sorted = this.lessons.slice().sort((a, b) => {
                let valA = a[this.sortBy];
                let valB = b[this.sortBy];

                // Compare strings alphabetically, numbers numerically
                if (typeof valA === "string") {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }

                if (valA < valB) return -1;
                if (valA > valB) return 1;
                return 0;
            });

            // Reverse the array for descending order
            if (this.sortOrder === "desc") {
                sorted.reverse();
            }
            return sorted;
        }
    }
});