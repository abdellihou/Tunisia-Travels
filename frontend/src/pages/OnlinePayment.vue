<template>
  <center>
    <div id="main">
      <form id="payment-form">
        <h3>
          CheckIn Date :<span> {{ checkIn }}</span>
        </h3>
        <h3>
          CheckOut Date : <span>{{ checkOut }}</span>
        </h3>
        <h3>
          Price Per Night : <span>{{ price }}TND</span>
        </h3>
        <h3>
          Number of Nights :<span> {{ numberOfNights }} </span>
        </h3>
        <h2>
          Total:
          <p>{{ total }} TND</p>
        </h2>
      </form>
    </div>
    <div id="main">
      <form id="payment-form">
        <input
          type="email"
          id="email"
          placeholder="Enter your email address to recive the confirmation"
          v-model="email"
        />
        <div id="card-element"></div>
        <button
          @click="test"
          id="submit"
          class="btn btn-primary btn-round btn-lg btn-block"
        >
          <div class="spinner hidden" id="spinner"></div>
          <span id="button-text">Pay</span>
        </button>

        <p id="card-error" role="alert"></p>
        <p class="result-message hidden">
          Payment
          <a>SUCCEEDED</a> Thank You!
        </p>
      </form>
    </div>
  </center>
</template>

<script>
import FormGroupInput from "../components/formGroupInput.vue";
import { loadStripe } from "@stripe/stripe-js";
import stripeKeyFront from "../../stripeKeyFront";
import router from "../router.js";
import axios from "axios";
export default {
  name: "OnlinePayment",
  components: {
    [FormGroupInput.name]: FormGroupInput,
  },
  data() {
    return {
      email: "",
      secret: "",
      stripe: null,
      card: null,
      id: "",
      checkIn: "",
      checkOut: "",
      price: "",
      numberOfNights: "",
      total: "",
    };
  },
  methods: {
    async test() {
      var purchase = {
        email: this.email,
        id: this.id,
      };
      document.querySelector("button").disabled = true;
      const result = await fetch(
        "http://localhost:5000/api/payment/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(purchase),
        }
      );
      let secret = (await result.json()).clientSecret;

      this.secret = secret;

      var payWithCard = function(stripe, card, clientSecret) {
        loading(true);
        stripe
          .confirmCardPayment(clientSecret, {
            receipt_email: document.getElementById("email").value,
            payment_method: {
              card: card,
            },
          })
          .then(function(result) {
            if (result.error) {
              showError(result.error.message);
            } else {
              orderComplete(result.paymentIntent.id);
            }
          });
      };

      var orderComplete = function(paymentIntentId) {
        loading(false);
        document.querySelector(".result-message a");

        document.querySelector(".result-message").classList.remove("hidden");
        document.querySelector("button").disabled = true;
      };
      var showError = function(errorMsgText) {
        loading(false);
        var errorMsg = document.querySelector("#card-error");
        errorMsg.textContent = errorMsgText;
        setTimeout(function() {
          errorMsg.textContent = "";
        }, 4000);
      };
      var loading = function(isLoading) {
        if (isLoading) {
          document.querySelector("button").disabled = true;
          document.querySelector("#spinner").classList.remove("hidden");
          document.querySelector("#button-text").classList.add("hidden");
        } else {
          document.querySelector("button").disabled = false;
          document.querySelector("#spinner").classList.add("hidden");
          document.querySelector("#button-text").classList.remove("hidden");
        }
      };
      payWithCard(this.stripe, this.card, this.secret);
    },
  },
  created() {
    this.checkIn = localStorage.getItem("start");
    this.checkOut = localStorage.getItem("end");
    this.price = localStorage.getItem("price");
    this.numberOfNights =
      (new Date(this.checkOut).getTime() - new Date(this.checkIn).getTime()) /
      (1000 * 60 * 60 * 24);
    this.total = this.numberOfNights * this.price;
  },

  mounted() {
    localStorage.removeItem("start");
    localStorage.removeItem("end");
    localStorage.removeItem("price");
  },

  async beforeMount() {
    this.id = window.location.pathname.slice(9);
    var stripe = await loadStripe(stripeKeyFront.publicKey);
    this.stripe = stripe;
    var elements = stripe.elements();
    var style = {
      base: {
        color: "#32325d",
        fontFamily: "Arial, sans-serif",
        fontSmoothing: "antialiased",
        fontSize: "16px",
        "::placeholder": {
          color: "#32325d",
        },
      },
      invalid: {
        fontFamily: "Arial, sans-serif",
        color: "#fa755a",
        iconColor: "#fa755a",
      },
    };
    var card = elements.create("card", { style: style });
    card.mount("#card-element");
    card.on("change", function(event) {
      document.querySelector("button").disabled = event.empty;
      document.querySelector("#card-error").textContent = event.error
        ? event.error.message
        : "";
    });
    this.card = card;
  },
};
</script>

<style scoped>
* {
  box-sizing: border-box;
}
body {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  display: flex;
  justify-content: center;
  align-content: center;
  height: 100vh;
  width: 100vw;
}
form {
  margin-top: 50px;
  width: 30vw;
  min-width: 500px;
  align-self: center;
  box-shadow: 0px 0px 0px 0.5px #f96332 0px 2px 5px 0px #f96332,
    0px 1px 1.5px 0px #f96332;
  border-radius: 7px;
  padding: 40px;
}
input {
  border-radius: 6px;
  margin-bottom: 6px;
  padding: 12px;
  border: 1px solid #f96332;
  height: 44px;
  font-size: 16px;
  width: 100%;
  background: white;
}
.result-message {
  line-height: 22px;
  font-size: 16px;
}
.result-message a {
  color: #f96332;
  font-weight: 600;
  text-decoration: none;
}
.hidden {
  display: none;
}
#card-error {
  color: #f96332;
  text-align: left;
  font-size: 13px;
  line-height: 17px;
  margin-top: 12px;
}
#card-element {
  border-radius: 4px 4px 0 0;
  padding: 12px;
  border: 1px solid #f96332;
  height: 44px;
  width: 100%;
  background: white;
}
#payment-request-button {
  margin-bottom: 32px;
}
/* Buttons and links */
button {
  margin-top: 10px;
  background: #f96332;
  color: #ffffff;
  font-family: Arial, sans-serif;
  border-radius: 0 0 4px 4px;
  border: 0;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: block;
  transition: all 0.2s ease;
  box-shadow: 0px 4px 5.5px 0px #f96332;
  width: 100%;
}
button:hover {
  filter: contrast(115%);
}
button:disabled {
  opacity: 0.5;
  cursor: default;
}
/* spinner/processing state, errors */
.spinner,
.spinner:before,
.spinner:after {
  border-radius: 50%;
}
.spinner {
  color: #ffffff;
  font-size: 22px;
  text-indent: -99999px;
  margin: 0px auto;
  position: relative;
  width: 20px;
  height: 20px;
  box-shadow: inset 0 0 0 2px;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}
.spinner:before,
.spinner:after {
  position: absolute;
  content: "";
}
.spinner:before {
  width: 10.4px;
  height: 20.4px;
  background: #f96332;
  border-radius: 20.4px 0 0 20.4px;
  top: -0.2px;
  left: -0.2px;
  -webkit-transform-origin: 10.4px 10.2px;
  transform-origin: 10.4px 10.2px;
  -webkit-animation: loading 2s infinite ease 1.5s;
  animation: loading 2s infinite ease 1.5s;
}
.spinner:after {
  width: 10.4px;
  height: 10.2px;
  background: #f96332;
  border-radius: 0 10.2px 10.2px 0;
  top: -0.1px;
  left: 10.2px;
  -webkit-transform-origin: 0px 10.2px;
  transform-origin: 0px 10.2px;
  -webkit-animation: loading 2s infinite ease;
  animation: loading 2s infinite ease;
}
@-webkit-keyframes loading {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes loading {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@media only screen and (max-width: 600px) {
  form {
    width: 80vw;
  }
}
</style>
