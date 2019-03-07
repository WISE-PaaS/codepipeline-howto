# WISE-PaaS CodePipeline

This document will explain how to implement the continuous integration and delivery using the WISE-PaaS CodePipeline.

### Table of Contents
- [Concept](#Concept)
- [Prerequisites](#Prerequisites)
- [Groovy Syntax](#groovy-syntax)
- [Develop a Build Pipeline](#Develop-a-Build-Pipeline)
- [Run a Pipeline](#Run-a-Pipeline)
- [Develop a Deploy Pipeline](#Develop-a-Deploy-Pipeline)
- [Submit Your SRP Package](#Submit-Your-SRP-Package)

## Concept

<br>

![ci-cd](files/ci-cd.png)

<br>

- The developer pushes the source code to the remote repository, such as GitLab.
- A pipeline can be triggered by a tag event.
- A pipeline can also be run manually on the WISE-PaaS CodePipeline.
- A **Build Pipeline** is run to build the source code and save the build package (.zip file) to the blob container.
- The app can be directly deployed by running the **Deploy Pipeline** on the source code.
- If the build package has been previously saved to the blob container, the **Deploy Pipeline** will download the package from the container first and then deploy the app.
- WISE-PaaS **CodePipeline** supports [Blue-Green Deployment](https://docs.cloudfoundry.org/devguide/deploy-apps/blue-green.html), so the staging app can wait for the QA team to finish the test successfully and switch to the production state.

<br>

## Prerequisites

### I. Apply for the CodePipeline 

1. File a [support ticket](https://portal-support.wise-paas.com/web/tickets.html) for the access to the CodePipeline service

The Org entry depends on your situation.

![support-ticket-codepipeline](files/ticket-codepipeline.png)

2. After getting approved, go to the [CodePipeline Portal](https://portal-codepipeline.wise-paas.com). Make sure you have the _Private_ section. This will be the place where you create your own pipelines.

![private](files/private.png)

<br>

### II. Create a Git Credential on CodePipeline

1. You must have a GitLab or GitHub account.

2. Go to your Pipeline Portal and hover over the little avatar icon at the top-right corner. The dropdown menu will show up.

3. Click Profile.

![profile](files/profile.png)

4. Click the Credential button on the sidebar.

5. Input the username and password of your GitLab/GitHub account.

6. Click the Add button. A new credential will be created. This credential will be used when you set up a new pipeline.

<br>

### III. Apply for the blob container

1. File a [support ticket](https://portal-support.wise-paas.com/web/tickets.html) for the access to a blob container.

![ticket-blob](files/ticket-blob.png)

2. You will receive two keys
- One is encrypted. It looks like 

``rjesasdasdQkz/VUO9CoKasdasd0hOX/0vwVFox21bmck7aVasdasdasdAAsdafswgsadFAdsfjYYgwoCe+wBasDq+FtEEU+SxXfsdfafhwerSDGserWNKZGWVTg==``

This will be used as a credential in your pipeline to operate the blob contaier.

- The other looks like

``https://wisepaasdevelop.blob.core.windows.net/srpok?sv=2018-01-01&si=sedev-1587307A233&sr=c&sig=NdaY8sdasdfWQEHFTWetdryweRGDSFnculq9AR%2BTRFA%5D``

This one can be used with the **Azure Storage Explorer** to connect to your blob container.

**Do not reveal this one to anyone because it is not encrypted.**

<br>

### IV. Download and install Microsoft Azure Storage Explorer

1. Download the [software](https://azure.microsoft.com/en-us/features/storage-explorer/) and install it on your computer.

2. Open the software and click "Add Account" button on the sidebar.

3. Select the following option and click Next

![blob setting uri](files/blob-setting1.png)

4. Paste the string starting with "https" into the URI field. The Display name wiil be automatically created.

![blob setting uri](files/blob-setting2.png)

5. Click connect. You should be able to see your blob container on the side. The container's name will be the same as your SRP name.

![blob container](files/blob.png)

6. Try to upload some files and then download them from the blob container.

<br>

### V. Apply for a new group on the WISE-PaaS Gitlab

1. File a [support ticket](https://portal-support.wise-paas.com/web/tickets.html) to create your own group on [WISE-PaaS Gitlab](http://advgitlab.eastasia.cloudapp.azure.com/). Please fill out the form with the following content.

    - Project: [CodePipeline]
    - Subject: [GitLab] Applying for the access to the WISE-PaaS GitLab
    - Description
      - Account: \<userAccount\>
      - Purpose: To develop the auto-deploy pipeline for the SRP: \<srpName\>

2. You will soon receive a confirmation that a group named as your SRP name has been created. You can create your own project inside the group

3. Make sure you can accesss the [blobUploadDownload](http://advgitlab.eastasia.cloudapp.azure.com/WISE-PaaS_CodePipeline/blobUploadDownload) repository. If you still don't have the permission, go to the ticket that you filed and comment down your problem, and someone will help you fix it shortly.

<br>

## Groovy Syntax

Our CodePipeline platform now offers three four types of the build environment
- go
- gradle
- npm
- npm_win7

The build script follows Groovy syntax. Use one of these options as your node name according to your need. The names should explain themselves clearly. Use `npm_win7` if you are working with Windows Command Prompt.

### dir

```groovy
dir('Test') {

  // Tasks

}
```

To run the tasks under the `Test` directory. If there is no such directory, then create the directory and jump into it.

### bat

To run the CLI commands for Windows.

```groovy
bat 'echo aaa'
bat "copy ..\\EI-Dashboard-Green-SonarProperties\\sonar-project.properties .\\"
bat "python api.test.py"
```

### sh

To run the CLI commands for Linux.

```groovy
sh 'echo aaa'
sh 'gradle build'
sh 'zip -r EI-Dashboard_$BuildID.zip ./*'
sh "python3 ReturnStageStatus.py"
```

### git

To download the source code from the remote git repository.

```groovy
git credentialsId: "${git_credential}", url: 'http://advgitlab.eastasia.cloudapp.azure.com/WISE-PaaS_CodePipeline/blobUploadDownload.git'
```

If you want to download the code from multiple repositories, make sure you download them into different local directories, otherwise the previous content will be overwritten. 

```groovy
dir("Demo_APITest") {
  git credentialsId: 'xxxxxxxxxxxxxxxxx', url: 'http://advgitlab.eastasia.cloudapp.azure.com/WISE-PaaS2.0_DevOps/Demo_RestfulAPITest.git'
}
dir("Demo_PerformanceTest") {
  git credentialsId: 'xxxxxxxxxxxxxxxxx', url: 'http://advgitlab.eastasia.cloudapp.azure.com/WISE-PaaS2.0_DevOps/Demo_PerformanceTest.git'
}
dir("Demo_WebUITest") {
  git credentialsId: 'xxxxxxxxxxxxxxxxx', url: 'http://advgitlab.eastasia.cloudapp.azure.com/WISE-PaaS2.0_DevOps/Demo_WebUITest.git'
}
```

### retry

Retry a code block if the execution of that block fails. The code block can be a **step**, a **stage**, or even the whole **pipeline**.

```groovy
retry(3) { // up to three times
  git credentialsId: 'xxxxxxxxxxxxxxxxxxxxx', url: 'http://advgitlab.eastasia.cloudapp.azure.com/WISE-PaaS2.0_DevOps/Demo_RestfulAPITest.git'
}
```

**Note:** You can only retry three times at most when you are using ``git`` to dowload the code.

### sleep

Wait for a period of time.

```groovy
// Wait for one minute
sleep time: 1, unit: 'MINUTES' 
```

### timeout

Stop the excution of the pipelone if the running time of a code block exceeds certain amount of time.

```groovy
timeout(time: 200, unit: 'SECONDS') {
  git credentialsId: 'xxxxxxxxxxxxxxxxxxx', url: 'http://advgitlab.eastasia.cloudapp.azure.com/WISE-PaaS2.0_DevOps/Demo_RestfulAPITest.git'
}
```

### retry and time

Combination of the ``retry`` and ``timeout`` is very useful.

```groovy
retry(3) {
  timeout(time: 200, unit: 'SECONDS') {
    git credentialsId: 'xxxxxxxxxxxxxxx', url: 'http://advgitlab.eastasia.cloudapp.azure.com/WISE-PaaS2.0_DevOps/Demo_RestfulAPITest.git'
  }
}
```

### ReadFile

To read the content of a file and convert it as a string variable.

```groovy
sh "cf login -u $cf_username -p $cf_password -o $cf_org -s $cf_space -a api.$cf_domain --skip-ssl-validation"
sh "cf org $cf_org --guid >> orgid.txt"
// Save the string into a variable
org_id = readFile('orgid.txt') 
```

<br>

## Develop a Build Pipeline

The following explanation is based on this [sample code](http://advgitlab.eastasia.cloudapp.azure.com/SE-Dev/Static-Sample-Code.git) and this [pipeline script](http://advgitlab.eastasia.cloudapp.azure.com/SE-Dev/Static-Sample-Code-Pipeline.git).

### Setup the parameters in your pipeline

1. First of all, you need to create a remote repository/project that has your _build_ and _deploy_ scripts. Here is an example of project called [Static-Sample-Code-Pipeline](http://advgitlab.eastasia.cloudapp.azure.com/SE-Dev/Static-Sample-Code-Pipeline).

2. Create another remote repository/project that has the source code of your app. Here is an example called [Static-Sample-Code](http://advgitlab.eastasia.cloudapp.azure.com/SE-Dev/Static-Sample-Code).

3. Go to your [CodePipeline Portal](https://portal-codepipeline.wise-paas.com) and **Add** a new pipeline called _StaticSampleCode_Build_ under the **private** section.

    Fill out the entries as following.

![add-pipeline](files/add-pipeline.png)

- ScriptPath: the build script's name in your project
- Credentials: select the one that you created for this GitLab account

<br>

4. After the new pipeline is created, click the **arrow** on the right side to bring up the dropdown menu. Go to the **Configuration** tab and add the following parameters.

![config-build](files/config-build.png)

  - **git_credential**
    - type: git_credentials
    - value: Select the credential that you added for this pipeline
  - **TagName**
    - type: string
    - value: Leave this entry empty if you want the pipeline to automatically get the version number from GitLab tags
  - **blob_container_key**
    - type: string
    - value: This is a encoded string from the URL that you use to access your blob container. **We strongly suggest that you set this key inside the pipeline's configuration instead of exposing it in your build script.**

<br>

### Script Explanation

**Choose the node name**
- go
- gradle
- npm
- npm_win7

The last one is to be used for the developers who are more comfortable with the Windows Command Prompt.

The prior three options are to be used for the Linux developing environment. However, it will not matter which one you choose if you don't have to compile/build your code, like the sample code we are using here, which is just a static web page.

```groovy
node('gradle') {
  ...

}
```

<br>

**Here are the variales that are not set in your pipeline**

```groovy
  // Store the pipeline execution result. The inital value is 'SUCCESS'.
	def result = "SUCCESS"

  // Prefix of the name of the package that you will upload to the blob.
  // Example: the package's name is 'StaticSampleCode_1.0.0.zip' 
	def app_package_name="StaticSampleCode"

  // The name of the container that you have requested in the previous step
	def blob_container="sedev"

  // def blob_container_key= 'we suggest you set this value in your pipeline'

  // URL of your remote repository for the source code
	def sourceCodeGitUrl="http://advgitlab.eastasia.cloudapp.azure.com/SE-Dev/Static-Sample-Code.git"
```

<br>

**_Prepare_ Stage**

```groovy
  stage('Prepare'){ 
    // Clean up all files from the previous execution
    sh 'rm -rf *'
    
    // Download the blob operation scripts to the Blob directory.
    dir("Blob"){
      retry(2){
        // ${git_credential} represents the value which you set in your pipeline
        git credentialsId: "${git_credential}", url: 'http://advgitlab.eastasia.cloudapp.azure.com/WISE-PaaS_CodePipeline/blobUploadDownload.git'
      }
    }	
  }
```

<br>

**_Build_ Stage**

```groovy
stage("Build") {
  // Create a directory called ${app_package_name} and go into that folder. The app_package_name is "StaticSampleCode" in this example.
  dir("${app_package_name}") {

    // Download the source code of your app from the remote repo
    retry(2){
      git credentialsId: "${git_credential}", url: "${sourceCodeGitUrl}"  
    }
    
    // If TagName is empty or you didn't set this value, the script will use the latest tag in your project
    if(TagName=="") {
      sh 'git describe --tags `git rev-list --tags --max-count=1`>newestTag.txt'  
      TagName = readFile("newestTag.txt")
    }
    
    // Switch to the code related to the TagName 
    sh "git checkout $TagName"
    
    // TagName: v-1.0.0 => packageVersion: 1.0.0
    packageVersion=TagName.tokenize('-')[1].tokenize()[0]
    
    // Build your source code if needed

    // sh "gradle build"
    // sh "gradle fatJar"
    // sh "gradle makeManifest"
  }
}
```

<br>

**_Archive_ Stage**

```groovy
  stage("Archive") {
    zipName="${app_package_name}_${packageVersion}.zip"

    dir("${app_package_name}"){
      // Zip all files => StaticSampleCode_1.0.0.zip
      sh "zip -r ${zipName} ./*"

      retry(2){
        // Upload the packge to the blob
        sh "python3 ../Blob/blobUploadDownload.py upload ${blob_container} ${zipName} ./${zipName} ${blob_container_key}"
      }
    }	
  }
```

Five parameters for running _blobUploadDownload_ script:
1. Action: upload/download
2. Blob container name
3. Name of the file used on the blob container
4. File to be uploaded
5. Encoded Key to access your blob container

<br>

**Another _Archive_ example when you run 'gradle'**

```groovy
  // The build files will be saved to the 'dist' folder
  stage("Archive") {
    zipName="${app_package_name}_${packageVersion}.zip"
    dir("${app_package_name}"){
      dir("${app_package_name}_${packageVersion}"){
        // Copy all files from the "dist" folder to the current folder
        // "dist" is a folder created while compiling 
        sh "cp ../dist/* ./"
        
        // Copy the mafifest file
        sh "cp ../manifest.yml ./"

        // Zip all files => StaticSampleCode_1.0.0.zip
        sh "zip -r ${zipName} ./*"

        retry(2){
          sh "python3 ../../Blob/blobUploadDownload.py upload ${blob_container} ${zipName}  ./${zipName} ${blob_container_key}"
        }
      }
    }	
  }
```

**The whole build script**

```groovy
node('gradle') {
	def result = "SUCCESS" 
	def app_package_name = "StaticSampleCode"
	def blob_container = "sedev"
	def sourceCodeGitUrl = "http://advgitlab.eastasia.cloudapp.azure.com/SE-Dev/Static-Sample-Code.git"

	try{                  
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
				
				if(TagName=="") {
				    sh 'git describe --tags `git rev-list --tags --max-count=1`>newestTag.txt'  
				    TagName=readFile("newestTag.txt")
				}
				sh "git checkout $TagName"
				packageVersion=TagName.tokenize('-')[1].tokenize()[0]
				
				//sh "gradle build"
				//sh "gradle fatJar"
				//sh "gradle makeManifest"
			}
		}

    stage("Archive") {
			zipName="${app_package_name}_${packageVersion}.zip"

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
	finally{
		// Set the execution state for the pipeline
		currentBuild.result = result
	}
}
```

<br>

## Run a Pipeline

Go to your CodePipeline Portal and click the **run** button on the right side of your pipeline.

![run pipeline](files/run-pipeline.png)

<br>

You may leave the ``TagName`` empty and click OK. The script will fetch the latest tag name of your project.

![confirm run](files/confirm-run.png)

<br>

Then you should see a flash prompt as following.

![run started](files/run-started.png)

<br>

If the pipeline is finished successfully, you should see a newly-added record nder the **BuildHistory** tab of your pipeline, showing "succeeded".

![run history](files/run-history.png)

<br>

Check your blob container with the Azure Storae Explorer to see if the package has been uploaded.

To refesh the page, click **More** button at the top-right corner and click **Refresh**.

![azure tool](files/azure-tool.png)


<br>

## Develop a Deploy Pipeline

<br>

## Submit Your SRP Package












