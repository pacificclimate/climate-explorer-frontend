node {
    stage('Code Collection') {
        checkout scm
    }

    nodejs('node') {
        stage('Installation') {
            sh 'npm install'
        }

        stage('Test Suite') {
            sh 'npm run jenkins-test'
        }
    }

    def image
    String name = BASE_REGISTRY + 'climate-explorer-frontend'

    // tag branch
    if (BRANCH_NAME != 'master') {
        name = name + ':' + BRANCH_NAME + "_${BUILD_ID}"
    } else {
        // check for git tag
        def tag = sh(returnStdout: true, script: "git tag --contains | head -1").trim()
        if (tag) {
            stage('EXTRA STAGE') {
                sh 'echo "YOU ARE HERE"'
            }
        }
    }


    stage('Build and Push Image') {
        withDockerServer([uri: PCIC_DOCKER]) {
            image = docker.build(name)

            docker.withRegistry('', 'PCIC_DOCKERHUB_CREDS') {
                image.push()
            }
        }
    }

    stage('Security Scan') {
        writeFile file: 'anchore_images', text: name
        anchore name: 'anchore_images', engineRetries: '700'
    }
}
