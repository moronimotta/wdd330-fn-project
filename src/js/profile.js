
import Profile from "./Profile.mjs";
import getLocalStorage from "./utils.mjs";
import Authentication from "./Authentication.mjs";


window.addEventListener("DOMContentLoaded", async () => {
    const auth = new Authentication();
    const ok = auth.isAuthenticated();

    if (!ok) {
        window.location.href = "/authentication/login";
    }

    const user = getLocalStorage("userAccount");
    const profile = new Profile(user.name, user.last_name, user.email, user.id);

    await profile.init();

});