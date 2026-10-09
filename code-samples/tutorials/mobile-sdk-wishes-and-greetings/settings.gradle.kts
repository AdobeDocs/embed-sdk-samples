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
        mavenCentral()
        // The SDK and its POM/transitive dependencies must come from an authorized distributor.
        // The URL and optional credentials are operator-local; never commit them to this sample.
        val sdkMavenUrl = providers.gradleProperty("embedSdkMavenUrl").orNull
            ?: System.getenv("EMBED_SDK_MAVEN_URL")
        require(!sdkMavenUrl.isNullOrBlank()) {
            "Set EMBED_SDK_MAVEN_URL to your approved SDK Maven repository."
        }
        maven {
            url = uri(sdkMavenUrl)
            val user = System.getenv("EMBED_SDK_MAVEN_USER")
            val token = System.getenv("EMBED_SDK_MAVEN_TOKEN")
            if (!user.isNullOrBlank() && !token.isNullOrBlank()) {
                credentials {
                    username = user
                    password = token
                }
            }
            content { includeGroup("com.adobe.express.embed") }
        }
    }
}

rootProject.name = "mobile-sdk-wishes-and-greetings"
include(":app")
