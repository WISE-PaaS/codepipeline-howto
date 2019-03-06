# WISE-PaaS CodePipeline

This document will explain how to implement the continuous integration and delivery using the WISE-PaaS CodePipeline.

<br>

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

**rjesasdasdQkz/VUO9CoKasdasd0hOX/0vwVFox21bmck7aVasdasdasdAAsdafswgsadFAdsfjYYgwoCe+wBasDq+FtEEU+SxXfsdfafhwerSDGserWNKZGWVTg==**

This will be used as a credential in your pipeline to operate the blob contaier.

- The other looks like

**https://wisepaasdevelop.blob.core.windows.net/srpok?sv=2018-01-01&si=sedev-1587307A233&sr=c&sig=NdaY8sdasdfWQEHFTWetdryweRGDSFnculq9AR%2BTRFA%5D**

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

## Build Pipeline

## Deploy Pipeline

