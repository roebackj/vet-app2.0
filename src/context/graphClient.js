// frontend/src/utils/graphClient.js
import { Client } from '@microsoft/microsoft-graph-client';
import { msalInstance, loginRequest } from '../components/msalInstance';

async function getAuthenticatedClient() {
  const account = msalInstance.getAllAccounts()[0];
  console.log('Account:', account);

  try {
    const tokenResponse = await msalInstance.acquireTokenSilent({ ...loginRequest, account });
    console.log('Token Response:', tokenResponse);

    if (!tokenResponse.accessToken) {
      throw new Error('Access token is empty.');
    }

    const client = Client.init({
      authProvider: (done) => {
        done(null, tokenResponse.accessToken);
      }
    });

    return client;
  } catch (error) {
    console.error('Error acquiring token silently:', error);
    throw error;
  }
}

export async function getUserDetails() {
  try {
    const client = await getAuthenticatedClient();
    const user = await client.api('/me').get();
    console.log('User Details:', user);
    return user;
  } catch (error) {
    console.error('Error fetching user details:', error);
    throw error;
  }
}

export async function getDriveItems() {
  try {
    const client = await getAuthenticatedClient();
    const items = await client.api('/me/drive/root/children').get();
    console.log('Drive Items:', items);
    return items;
  } catch (error) {
    console.error('Error fetching drive items:', error);
    throw error;
  }
}

export async function getTeamsFiles() {
  try {
    const client = await getAuthenticatedClient();
    const teamsFiles = await client.api('/me/joinedTeams').get();
    console.log('Teams Files:', teamsFiles);

    let files = [];
    for (const team of teamsFiles.value) {
      const channels = await client.api(`/teams/${team.id}/channels`).get();
      for (const channel of channels.value) {
        try {
          const channelFiles = await client.api(`/teams/${team.id}/channels/${channel.id}/filesFolder`).get();
          console.log(`Files for channel ${channel.id}:`, channelFiles);
          if (channelFiles.value) {
            files = [...files, ...channelFiles.value];
          }
        } catch (error) {
          console.error(`Error fetching files for channel ${channel.id} in team ${team.id}:`, error);
        }
      }
    }
    return files;
  } catch (error) {
    console.error('Error fetching teams files:', error);
    throw error;
  }
}