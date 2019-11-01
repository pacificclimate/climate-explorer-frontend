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

    if (BRANCH_NAME.toLowerCase() != 'master') {
        name = name + '-' + BRANCH_NAME
    }

    stage('Build and Push Image') {
        withDockerServer([uri: PCIC_DOCKER]) {
            name = name + ":${BUILD_ID}"
            image = docker.build(name)

            docker.withRegistry('', 'PCIC_DOCKERHUB_CREDS') {
                image.push()
            }
        }
    }

    stage('Security Scan') {
        writeFile file: 'anchore_images', text: name
        anchore name: 'anchore_images'
    }
}
