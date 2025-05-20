Java.perform(function () {
    console.log("-> Bypassing SSL Pinning...");

    var SSLContext = Java.use("javax.net.ssl.SSLContext");

    SSLContext.init.overload(
        "[Ljavax.net.ssl.KeyManager;",
        "[Ljavax.net.ssl.TrustManager;",
        "java.security.SecureRandom"
    ).implementation = function (keyManager, trustManager, secureRandom) {
        console.log("SSLContext.init() called — bypassing SSL pinning");

        var TrustManager = Java.use("javax.net.ssl.X509TrustManager");
        var X509Certificate = Java.use("java.security.cert.X509Certificate");

        // Create a custom TrustManager that does nothing (accepts all certs)
        var TrustManagerImpl = Java.registerClass({
            name: "org.owasp.trust.AllTrustManager",
            implements: [TrustManager],
            methods: {
                checkClientTrusted: function (chain, authType) {},
                checkServerTrusted: function (chain, authType) {},
                getAcceptedIssuers: function () {
                    return Java.array("java.security.cert.X509Certificate", []);
                }
            }
        });

        var trustManagers = Java.array("javax.net.ssl.TrustManager", [TrustManagerImpl.$new()]);

        // Call the original method with custom trust managers and original args
        this.init(keyManager, trustManagers, secureRandom);
    };
});
