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
        String image_name = 'climate-explorer-frontend'
        String branch_name = env.BRANCH_NAME

        // Update image name if we are not on the master branch
        if (branch_name != 'master') {
            image_name = image_name + '/' + branch_name
        }

        withDockerServer([uri: env.PCIC_DOCKER]) {
            def image = docker.build(image_name)
        }
    }
}
