plugins {
    id("com.android.application")
}

android {
    namespace = "com.example.wishesdemo"
    compileSdk = 36

    defaultConfig {
        // Must match the package name Adobe registered for your client ID (see WishesSdk.kt).
        applicationId = "add-your-app-id-here"
        minSdk = 28
        targetSdk = 35
        versionCode = 1
        versionName = "1.0"
    }
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
}

dependencies {
    implementation("com.adobe.express.embed:embedsdk:1.1.1-beta")
    implementation("androidx.appcompat:appcompat:1.7.0")
    implementation("androidx.activity:activity-ktx:1.9.3")
    implementation("androidx.lifecycle:lifecycle-viewmodel-ktx:2.8.7")
    implementation("androidx.lifecycle:lifecycle-livedata-ktx:2.8.7")
    implementation("com.google.android.material:material:1.12.0")
}
