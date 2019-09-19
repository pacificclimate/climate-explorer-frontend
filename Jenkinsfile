node {
    nodejs('node') {
        stage('Installation') {
            sh 'npm install'
        }
        stage('Test Suite') {
            sh 'npm run ci'
        }
    }
    stage ('Build Image') {
        withDockerServer([uri: env.PCIC_DOCKER]) {
            def freshImage = docker.build("testimage")
        }
    }
}
