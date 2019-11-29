/**
 * Given an image name publish it to the PCIC docker registry
 *
 * @param image_name the name of the image
 * @return if successful the same image name
 */
def publish_image(image_name) {
    withDockerServer([uri: PCIC_DOCKER]) {
        image = docker.build(image_name)

        docker.withRegistry('', 'PCIC_DOCKERHUB_CREDS') {
            image.push()
        }
    }

    return image_name
}


/**
 * Detect if the branch is tagged then pass to `publish_image()`
 *
 * This method is used if Jenkins detects that we are on the master branch. In
 * the case of master branches we want to push with the tag
 * (ex. `org/tool:1.0.0`) AND as `latest`.
 *
 * @param image_name the name of the image
 * @return image_names list of image names that were built and published
 */
def publish_master_image(image_name) {
    def image_names = []
    String tag = sh (script: 'git tag --contains', returnStdout: true).trim()

    if(!tag.isEmpty()) {
        image_names.add(publish_image(image_name + ':' + tag))
        image_names.add(publish_image(image_name + ':latest'))
    } else {
        image_names.add(publish_image(image_name))
    }

    return image_names
}


/**
 * Build Docker images locally and publish them to the PCIC registry
 *
 * @return image_names list of image names that were built and published
 */
def build_and_publish() {
    // String image_name = BASE_REGISTRY + 'climate-explorer-frontend'
    String image_name = BASE_REGISTRY + 'cef-test'
    def image_names = []

    // if (BRANCH_NAME == 'master') {
    if (BRANCH_NAME == 'jenkins-tag-tracking') {
        published = publish_master_image(image_name)
        image_names = image_names + published
    } else {
        image_names.add(publish_image(image_name + ":$BRANCH_NAME"))
    }

    return image_names
}


/**
 * Conduct Anchore image scan
 *
 * @param image_names list of images to scan
 */
def scan_images(image_names) {
    image_names.each { name ->
        writeFile file: 'anchore_images', text: name
        anchore name: 'anchore_images', engineRetries: '700'
    }
}


/**
 * Clean up images
 *
 * @param image_names list of images to clean
 */
def clean_local_images(image_names) {
    withDockerServer([uri: PCIC_DOCKER]){
        image_names.each { name ->
            sh "docker rmi ${name}"
        }
    }
}


node {
    stage('Clean Workspace') {
        cleanWs()
    }

    stage('Code Collection') {
        checkout scm
        sh 'git fetch'
    }

    nodejs('node') {
        stage('Installation') {
            sh 'npm install'
        }

        stage('Test Suite') {
            sh 'npm run jenkins-test'
        }
    }

    def image_names
    stage('Build and Publish Image') {
        image_names = build_and_publish()
        echo "$image_names"
    }

    stage('Security Scan') {
        scan_images(image_names)
    }

    stage('Clean Local') {
        clean_local_images(image_names)
    }
}
