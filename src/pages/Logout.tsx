export function LogoutPage() {
    // For synchronous logout BE - FE
    localStorage.clear();
    window.location.href = "/login";
    return null;
}