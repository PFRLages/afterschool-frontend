// Base URL of the Express API (will be changed to the live URL when deployed)
const apiUrl = "http://localhost:3000";

new Vue({
    el: "#app",

    data: {
        apiUrl: apiUrl,
        lessons: [],          // all lessons fetched from the backend
        cart: [],             // lesson IDs added to the cart (duplicates = quantity)
        showCart: false,      // toggles between the lessons page and the cart page
        searchQuery: "",      // current text in the search box
        sortBy: "topic",
        sortOrder: "asc",
        order: {              // checkout form fields
            name: "",
            phone: ""
        },
        orderSubmitted: false // shows the confirmation message after checkout
    },

    // Fetch the lessons from the API when the page loads
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
        // Lessons sorted by the selected attribute and order
        sortedLessons: function () {
            const sorted = this.lessons.slice().sort((a, b) => {
                let valA = a[this.sortBy];
                let valB = b[this.sortBy];
                if (typeof valA === "string") {
                    valA = valA.toLowerCase();
                    valB = valB.toLowerCase();
                }
                if (valA < valB) return -1;
                if (valA > valB) return 1;
                return 0;
            });
            if (this.sortOrder === "desc") {
                sorted.reverse();
            }
            return sorted;
        },

        // Groups the cart into one entry per lesson with its quantity and subtotal
        groupedCart: function () {
            const groups = [];
            this.cart.forEach((id) => {
                const existing = groups.find(function (g) { return g.lesson._id === id; });
                if (existing) {
                    existing.quantity++;
                } else {
                    const lesson = this.lessons.find(function (l) { return l._id === id; });
                    if (lesson) {
                        groups.push({ lesson: lesson, quantity: 1 });
                    }
                }
            });
            return groups;
        },

        // Total price of everything in the cart
        cartTotal: function () {
            return this.groupedCart.reduce(function (sum, g) {
                return sum + g.lesson.price * g.quantity;
            }, 0);
        },

        // Name must contain letters (and spaces) only
        nameValid: function () {
            return /^[A-Za-z ]+$/.test(this.order.name);
        },

        // Phone must contain digits only (7 to 15 of them)
        phoneValid: function () {
            return /^[0-9]{7,15}$/.test(this.order.phone);
        },

        // Checkout is allowed only when both fields are valid and the cart is not empty
        canCheckout: function () {
            return this.nameValid && this.phoneValid && this.cart.length > 0;
        }
    },

    methods: {
        // Adds one space of a lesson to the cart and decreases its availability
        addToCart: function (lesson) {
            if (lesson.space > 0) {
                this.cart.push(lesson._id);
                lesson.space--;
            }
        },

        // Removes ONE space of a lesson from the cart and restores its availability
        removeOne: function (lesson) {
            const index = this.cart.indexOf(lesson._id);
            if (index !== -1) {
                this.cart.splice(index, 1);
                lesson.space++;
            }
        },

        // Removes ALL spaces of a lesson from the cart at once
        removeAll: function (lesson) {
            const count = this.cart.filter(function (id) { return id === lesson._id; }).length;
            this.cart = this.cart.filter(function (id) { return id !== lesson._id; });
            lesson.space += count;
        },

        // Called on every keystroke in the search box (wired to the backend next)
        searchLessons: function () {
        },

        // Switches between the lessons page and the cart page
        toggleCart: function () {
            this.showCart = !this.showCart;
            this.orderSubmitted = false;
        },

        // Sends the order to the backend, then updates each lesson's spaces in the database
        submitOrder: function () {
            const orderData = {
                name: this.order.name,
                phone: this.order.phone,
                lessonIDs: this.cart,
                spaces: this.cart.length
            };

            fetch(apiUrl + "/orders", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(orderData)
            })
                .then(function (response) {
                    return response.json();
                })
                .then(() => {
                    // Persist the new space count of each ordered lesson
                    const updates = this.groupedCart.map((g) => {
                        return fetch(apiUrl + "/lessons/" + g.lesson._id, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ space: g.lesson.space })
                        });
                    });
                    return Promise.all(updates);
                })
                .then(() => {
                    // Clear the cart and show the confirmation message
                    this.cart = [];
                    this.order.name = "";
                    this.order.phone = "";
                    this.orderSubmitted = true;
                })
                .catch(function (err) {
                    console.error("Failed to submit order:", err);
                });
        }
    }
});