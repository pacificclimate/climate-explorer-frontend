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
    if (BRANCH_NAME == 'master') {
        // TODO: detect tags and releases for master
    } else {
        name = name + ':' + BRANCH_NAME
    }

    stage('Build and Publish Image') {
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

    stage('Clean Up Local Image') {
        withDockerServer([uri: PCIC_DOCKER]){
            sh "docker rmi ${name}"
        }
    }
}
