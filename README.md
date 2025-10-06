# Payload CMS Multi-Language Website Boilerplate

> [!IMPORTANT]
>
> This repo is archived and will not be developed any further. I'm working on this [Boilerplate](https://github.com/tarikkavaz/Payload-Localized-Boilerplate) instead.



This is a website boilerplate for [Payload CMS](https://payloadcms.com/) with localization.
It is a modified version of the [Payload CMS Localization Example](https://github.com/payloadcms/payload/tree/main/examples/localization)

## Setup

1. `git clone https://github.com/tarikkavaz/Payload-Localized-Website.git` Clone the repository
2. `cd Payload-Localized-Website` Navigate to the project directory
3. `cp .env.example .env` (copy the .env.example file to .env) 
4. `docker compose up`
5. Seed your database in the admin panel (see below)

## Seed

To seed the database with a few pages and posts you can click the 'seed database' link from the admin panel.
The seed contains English and Turkish pages and posts. 

## Add Locale

To add a locale to the app, edit the file `src/i18n/localization.ts` .
Add your locale code and name as a label. The file is self-explanatory.

## Difference

You can see the difference between the initial and current codebase in the [difference.md](./difference.md) file.
