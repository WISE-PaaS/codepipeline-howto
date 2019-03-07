node('gradle') {
  def result = "SUCCESS"
  def app_package_name = "StaticSampleCode"
  def blob_container = "sedev"
  def sourceCodeGitUrl = "http://advgitlab.eastasia.cloudapp.azure.com/SE-Dev/Static-Sample-Code.git"

  try {
    stage('Prepare') {
      sh 'rm -rf *'

      dir("Blob") {
        retry(2) {
          git credentialsId: "${git_credential}", url: 'http://advgitlab.eastasia.cloudapp.azure.com/WISE-PaaS_CodePipeline/blobUploadDownload.git'
        }
      }
    }

    stage("Build") {
      dir("${app_package_name}") {
        retry(2) {
          git credentialsId: "${git_credential}", url: "${sourceCodeGitUrl}"
        }

        if (TagName == "") {
          sh 'git describe --tags `git rev-list --tags --max-count=1`>newestTag.txt'
          TagName = readFile("newestTag.txt")
        }
        sh "git checkout $TagName"
        packageVersion = TagName.tokenize('-')[1].tokenize()[0]

        //sh "gradle build"
        //sh "gradle fatJar"
        //sh "gradle makeManifest"
      }
    }

    stage("Archive") {
      zipName = "${app_package_name}_${packageVersion}.zip"

      dir("${app_package_name}") {
        sh "zip -r ${zipName} ./*"
        retry(2) {
          sh "python3 ../Blob/blobUploadDownload.py upload ${blob_container} ${zipName} ./${zipName} ${blob_container_key}"
        }
      }
    }
  }
  catch (exc) {
    // Set result to "FAILURE" if any error occurs
    result = 'FAILURE'
  }
  finally {
    // Set the execution state for the pipeline
    currentBuild.result = result
  }
}