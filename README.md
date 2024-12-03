![Hegemony][titleImg]

# Table of Contents
- [Table of Contents](#table-of-contents)
- [Synopsis](#synopsis)
- [Tech Stack](#tech-stack)
- [Usage](#usage)
  - [Selecting An Empire](#selecting-an-empire)
  - [Home](#home)
  - [Profile](#profile)
    - [Edit Your Profile](#edit-your-profile)
  - [Jobs](#jobs)
    - [Work Your Job](#work-your-job)
  - [Businesses](#businesses)
    - [Create A Business](#create-a-business)
    - [View Your Businesses](#view-your-businesses)
  - [Congregations](#congregations)
    - [Create A Congregation](#create-a-congregation)
    - [View Your Congregations](#view-your-congregations)
  - [States](#states)
    - [Create A State](#create-a-state)
    - [View Your States](#view-your-states)
- [Reference](#reference)
  - [Variables](#variables)
  - [Calculations](#calculations)
- [Issues](#issues)
- [Contributions](#contributions)
- [To Do List](#to-do-list)

# Synopsis

**Hegemony** is an online economy game. **Find a Job, start a Business, formulate Congregations, and bring them all together into States.** Choose from one of three 
empires to begin and represent your empire by helping its economy flourish with your 
additions. Make friends and customize your profile using our pre-selected list of 
profile art (all icons by [Icons8][icons8Link]). Sit back and collect your estate's passive income as your assets and empire grow! Hegemony is available to play [here][appLink].

# Tech Stack

Hegemony was built on the following **technologies:**

[![React][reactImg]][reactLink]
[![Next][nextImg]][nextLink]
[![TypeScript][typescriptImg]][typescriptLink]
[![Vercel][vercelImg]][vercelLink]

It is a **Next 14** project, therefore it is a **React** app at its core, which employs **TypeScript** and uses **Vercel** to host the application.

# Usage
Navigate to the Hegemony landing page and click the *Play* button to create an account. This will redirect you to the sign-up page.*

![Sign Up Screen][signupScreenshot]
**You may also choose to log in if you're already an existing user*

## Selecting An Empire

Once you are logged in, the first thing the app mandates you to do is **select an Empire.**

![Pick Empire Screenshot][pickEmpireScreenshot]

Click on the card of your Empire's choice, and click the *Select* button to confirm your choice. **YOU CANNOT CHANGE YOUR EMPIRE ONCE SELECTED!**

After choosing your Empire, you can click the *Menu* icon at the very top-left corner of the page to access the **Navigation Bar.** This is how we can navigate between the primary pages of the game as referenced in the following sections. At the bottom of the Navigation Bar, you will also find a sign out button if necessary.*

**Currently, sessions are valid for 8 hours at a time. However, it is always best practice to sign out when you are done using Hegemony.*

## Home

In the homepage, you will find your **invites and friend requests.**

![Home Screenshot][homeScreenshot]

The *Your Invites* module will populate with all your invites, for example, when a user invites one of your Congregations to a new State they're forming. The *Friend Requests* module will populate with all friend requests that are directed to you. From here, you can choose to *Accept* or *Decline* any invites or requests you receive.

## Profile

Navigate to your **Profile Page** by selecting it from the Navigation Bar for an overview of your user profile.

![Profile Screenshot][profileScreenshot]

Use the *Find Friends* module to **search for other players by username and send them friend requests.** The *Friends List* module will show all of your current friends.

### Edit Your Profile

Use the inputs to **change your name and create a bio.** Make sure to click *Save* after making any changes. Click on your profile picture to change the displayed icon.

![Change Picture Screenshot][changePictureScreenshot]

**Select the profile picture you want** from the displayed list, and click *Save* to effectuate the changes.

## Jobs
Navigate to your **Job Page** by selecting it from the Navigation Bar for an overview of your current job. When you first create an account, you will be prompted to *Find a Job* on this page. Click this option to look for a job.

![Job List Screenshot][jobListScreenshot]

**Select a job;** once chosen, you cannot change this unless you are fired by the business owner. Once you click *Select* and successfully get your chosen job, you will be redirected back to your Job page.

### Work Your Job
Once you've chosen a job, your Job page will show you an interface to clock in and clock out of work.

![Job Interface Screenshot][jobInterfaceScreenshot]

Clock in to your job and you will begin earning passively as long as you are clocked in. The interface will reflect your earnings and the time you've spent clocked in. Feel free to leave the page or even log out, you will stay clocked in and earning regardless, until you've clocked out.

**Be careful, overtime is not observed!*** You may clock into work for as long as you'd like but **you will only be paid for your first 8\* hours of each shift.** You'll notice that the interface's earnings tracker will stop increasing after this payable work period has passed. Once you clock back out, a **4\* hour cooldown timer will begin before you can clock back in** for another paid shift. It is your responsibility to clock in and out in a timely manner to maximize your earnings.

**Subject to change*

## Businesses

Navigate to your Businesses page by selecting it in the Navigation Bar. Here you will find an overview of all your Businesses, and an interface to create a new Business.

![Business Page Screenshot][businessPageScreenshot]

The *Total Earnings* tracker on this page will reflect how much gold all you're Businesses have earned in real-time (it may take some time to calculate this value).

### Create A Business

Enter a name for your new Business. Enter an employee rank increase for your new Business; this value is how much your employees' earnings increase for each rank they hold at your Business (this should be a non-negative number and is applied to formulate a percentage of your Business' total revenue which goes to its employees; see the [Reference](#reference) for more details).

![Purchase Business Screenshot][purchaseBusinessScreenshot]

Use the State name and Congregation name filters to search for a Congregation to start your new Business in. Notice that each Congregation's State tax, Congregation tax, and Labor Split are shown. Click the *Select* button for the Congregation of your choice. Lastly, use the drop-down list at the bottom left of the interface to select the type of business you'd like to start. Click on the price tag to purchase your new Business (provided you have sufficient funds).

Once you successfully purchase a new Business, you will be redirected to the Business' page.

### View Your Businesses

Your newly purchased Businesses will populate in the *Your Businesses* module on the Businesses page. Click on a Business from this module to view it in detail.

![View A Business][viewBusinessScreenshot]

Here, you will find details of the selected Business, including the business owner and its earnings calculation details. The *Current Earnings* tracker on this page will reflect how much gold this Business has earned in real-time.

As owner, click the *Collect* button to collect the gold your Business has earned so far. You can also *Edit Workers* to view, promote, or fire anyone currently working for your Business. All of your collections are monitored and tracked. Click *View Collections* to look into the history of your collections for this Business.

## Congregations

Navigate to your Congregation page by selecting it in the Navigation Bar. Here you will find an overview of all your Congregations.

![Congregation Page Screenshot][congregationPageScreenshot]

The *Total Potential Revenue* tracker on this page will reflect how much gold all you're Congregations stand to earn in real-time (it may take some time to calculate this value).

### Create A Congregation

Click the *New Congregation* button to create a new Congregation. Follow the instructions on the screen to create your 3 starting Businesses for the new Congregation. Once you've filled all fields and selected a State for your new Congregation, click the price tag to purchase your new Congregation (provided you have sufficient funds).

![Purchase Congregation Screenshot][purchaseCongregationScreenshot]

Once you've successfully purchased a new Congregation, you will be redirected to the Congregation's page.

### View Your Congregations

Your newly purchased Congregations will populate in the *Your Congregations* module on the Congregations page. Find your newly created Congregation (you can filter through these using State and Congregation names), click on it, and click the *View* button to see the details of the selected Congregation.

![View Congregation Screenshot][viewCongregationScreenshot]

Here, you will find details of the selected Congregation, including the congregation owner and its earnings calculation details. The *Potential Earnings* tracker on this page will reflect how much gold this Congregation stands to earn in real-time. Notice that a newly created Congregation starts off with *Settlement* status. **Congregations become cities once they have at least 10 Businesses.**

As owner, click the *View Collections* button to view the gold your Congregation has earned so far. Each time a Business in your Congregation collects their earnings, you make a profit, partially based on the Congregation's earnings calculation details (see the [Reference](#reference) for more information).

## States

Navigate to your States page by selecting it in the Navigation Bar. Here you will find an overview of all your States.

![State Page Screenshot][statePageScreenshot]

The *Total Potential Revenue* tracker on this page will reflect how much gold all you're States stand to earn in real-time (it may take some time to calculate this value).

### Create A State

Click the *New State* button to create a new State. Create a name for your new State and set its State Tax rate. 

![Purchase State Screenshot][purchaseStateScreenshot]

Use the *Select Congregations* module to move Congregations that you own to your to-be-created State. Use the *Invite Congregations* module to invite other Congregations to your to-be-created State. Click *Invite* on a Congregation in this module and once the Congregation owner accepts, click *Select* on the invited Congregation to move it to your to-be-created State. 

Each State requires **10 Cities (NOT SETTLEMENTS)** at a minimum. Once you've selected all the Congregations that you want to be a part of your new State, click the price tag to purchase your new State (provided you have sufficient funds).

Once you've successfully purchased a new State, you will be redirected to the State's page.

### View Your States

Your newly purchased State will populate in the *Your States* module on the States page. Find your new State (you can filter through these using State name), click on it, and click the *View* button to see the details of the selected State.

![View State Screenshot][viewStateScreenshot]

Here, you will find details of the selected State, including the state owner and its earnings calculation details. The *Potential Earnings* tracker on this page will reflect how much gold this State stands to earn in real-time.

As owner, click the *View Collections* button to view the gold your State has earned so far. Each time a Business in your State collects their earnings, you make a profit, partially based on the State's earnings calculation details (see the [Reference](#reference) for more information).

# Reference

The following section details the **math behind the logic of Hegemony.** Hegemony is a game very early in its lifecycle; the **calculations you find in this section are subject to change** based on the growth of the game or its community. Thank you for your understanding.

## Variables

Use the following table to find what each variable in the game's calculations represents:

| Name                        | Variable      | Description |
| --------------------------- | ------------- | ----------- |
| Base Earning Rate           | **BER**           | Core earning value for a business (gold per second) |
| Multipliers                 | **M**             | Active Multipliers (none in v1, M always equals 1) |
| Worker Count                | **W**             | Number of workers at a given business |
| Revenue                     | **R**             | Raw earnings of a given business (gold per second) |
| Wage                        | **WA**            | Earnings of a worker at a given business (gold per second) |
| Labor Split                 | **LS**            | Portion of business' earnings that go to a single employee (%) |
| Worker Rank                 | **WR**            | Rank of a given employee at a given business |
| Rank Multiplier             | **RM**            | Employee earning increase by rank for a given business (% per rank) |
| Business Count              | **B**             | Number of businesses in a given state or congregation        |
| State Tax Rate              | **ST**            | Portion of revenue that goes to the state (%) |
| Congregation Tax Rate       | **CT**            | Portion of revenue that goes to the congregation (%) |
| Earning Rate                | **ER**            | Total earnings of a business after all taxes & deductions (gold per second) |

## Calculations

The **Revenue** of a business is given as:
$$R = {BER * M * (3 + W)}$$

Then, the **Wage** of a worker at this business can be found using:
$$WA_i = {[(WR_i * RM) + LS] * R}$$

For a state, we can calculate its earnings based on all businesses in the state using
$$\sum_{i=1}^B ST * R_i$$

For a congregation, we can calculate its earnings based on all businesses in the congregation using
$$\sum_{i=1}^B CT * R_i$$

Finally, we have the **Earning Rate** for a given business as follows:
$$ER = {[1 - ST - CT - \sum_{i=1}^W (WR_i * RM + LS)] * R}$$

# Issues

Create an [issue][issueLink] if you need to contact us about an existing problem or bug in Hegemony. It may take some time for us to respond to and resolve complex issues.

# Contributions

Fork this repository and open a [pull request][contributionLink] to suggest any feature additions. Your request will be reviewed and responded to accordingly.

# To Do List
- [x] User Authentication
- [x] Landing/Login
- [x] Home
- [x] Empire
- [x] Profile
- [x] Job
- [x] Business
- [x] Congregation
- [x] State
- [x] Readme (Instructions)

[titleImg]: /readmeAssets/title.png
[signupScreenshot]: /readmeAssets/signupScreenshot.png
[pickEmpireScreenshot]: /readmeAssets/pickEmpireScreenshot.png
[jobListScreenshot]: /readmeAssets/jobListScreenshot.png
[jobInterfaceScreenshot]: /readmeAssets/jobInterfaceScreenshot.png
[businessPageScreenshot]: /readmeAssets/businessPageScreenshot.png
[purchaseBusinessScreenshot]: /readmeAssets/purchaseBusinessScreenshot.png
[viewBusinessScreenshot]: /readmeAssets/viewBusinessScreenshot.png
[congregationPageScreenshot]: /readmeAssets/congregationPageScreenshot.png
[purchaseCongregationScreenshot]: /readmeAssets/purchaseCongregationScreenshot.png
[viewCongregationScreenshot]: /readmeAssets/viewCongregationScreenshot.png
[statePageScreenshot]: /readmeAssets/statePageScreenshot.png
[purchaseStateScreenshot]: /readmeAssets/purchaseStateScreenshot.png
[viewStateScreenshot]: /readmeAssets/viewStateScreenshot.png
[homeScreenshot]: /readmeAssets/homeScreenshot.png
[profileScreenshot]: /readmeAssets/profileScreenshot.png
[changePictureScreenshot]: /readmeAssets/changePictureScreenshot.png

[typescriptImg]: https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white
[reactImg]: https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=1c2c4c
[nextImg]: https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white
[vercelImg]: https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white

[appLink]: https://hegemony.vercel.app
[icons8Link]: https://icons8.com
[typescriptLink]: https://www.typescriptlang.org/
[reactLink]: https://react.dev/
[nextLink]: https://nextjs.org/
[vercelLink]: https://vercel.com
[issueLink]: https://github.com/ranjotdharni/ecos/issues
[contributionLink]: https://github.com/ranjotdharni/ecos/pulls