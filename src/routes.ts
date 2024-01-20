import { Request, Response, Application } from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import 'dotenv/config'

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);


async function getLogin(req: Request, res: Response) {
    const type: string = 'LOGIN';
    const email = process.env.AUTH_EMAIL || '';
    const password = process.env.AUTH_PASSWORD || '';
    try {
        const { error, data } =
            type === 'LOGIN'
                ? await supabase.auth.signInWithPassword({ email, password })
                : await supabase.auth.signUp({ email, password })
        if (!error && !data) {
            res.status(500).send('Check your email for the login link!');
        }
        if (error) {
            res.status(500).send('Error returned:' + error.message);
        }
        res.status(200).send(data);
    } catch (error) {
        console.log('Error thrown:', error)
    }
}

async function getCommits(req: Request, res: Response) {
    try {
        const { data, error } = await supabase
            .from('commits')
            .select('*');

        if (error) {
            throw error;
        }

        res.json(data);
    } catch (error) {
        console.error('Error fetching commits from Supabase:', error);
        res.status(500).send('Error fetching commits');
    }
};

async function addCommits(req: Request, res: Response) {
    try {
        const username = req.params.username;
        const commits = await fetchGitHubCommits(username);
        // Insert data into Supabase
        for (const commit of commits) {
            await supabase.from('commits').insert(commit).single();
        }

        res.send({
            data: commits,
            message: 'Commits fetched and inserted into Supabase'
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error fetching commits');
    }
};

const fetchGitHubCommits = async (username: string) => {
    let commits: any = [];
    const url = `https://api.github.com/users/${username}/repos`;
    const response = await axios.get(url);
    for (const repo of response.data) {
        const repoURL = `https://api.github.com/repos/${username}/${repo.name}/commits`;
        const responseRepo = await axios.get(repoURL);
        // List commits for each repository
        for (const commit of responseRepo.data) {
            const commitData: any = {
                username: username,
                repo: repo.name,
                message: commit.commit.message,
                committedDate: commit.commit.committer.date
            };
            commits.push(commitData);
        }
    }
    return commits;
}

export const routes = (app: Application): void => {
    app.get('/api/github/login', getLogin);
    app.get('/api/github/commits', getCommits);
    app.get('/api/github/commit/:username', addCommits);
}