
import Profile from "./Profile.mjs";
import getLocalStorage from "./utils.mjs";
import Authentication from "./Authentication.mjs";
import { loadHeaderFooter, loadBtnAccount } from "./utils.mjs";



window.addEventListener("DOMContentLoaded", async () => {
    const auth = new Authentication();
    const ok = auth.isAuthenticated();
    
    if (!ok) {
        window.location.href = "/authentication/login";
    }
    
    loadHeaderFooter().then(() => {
            loadBtnAccount();
        });

    const user = getLocalStorage("userAccount");
    const profile = new Profile(user.email);

    await profile.init();

});