pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}

dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        // The Adobe Express Embed SDK is published on Maven Central.
        mavenCentral()
    }
}

rootProject.name = "mobile-sdk-wishes-and-greetings"
include(":app")
