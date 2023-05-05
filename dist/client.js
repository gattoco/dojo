"use strict";
RegisterKeyMapping('smokebomb-ts', 'Smokebomb', 'keyboard', '4');
RegisterCommand('smokebomb-ts', () => {
    emit('dojo:throwSmokeBomb-ts');
}, false);
on('dojo:throwSmokeBomb-ts', () => {
    throwSmokeBomb();
});
const smokePrepTime = 1500;
const smokeDuration = 10000;
const smokeInvisibleRadius = 2;
const playerPed = PlayerPedId();
let playerCoords;
let smokeEffectCoords;
//"Throw" smokebomb animation
const throwAnimDict = "anim@heists@narcotics@trash";
const throwAnim = "throw";
//Helper 
async function loadAnimDict(animDict) {
    RequestAnimDict(animDict);
    while (!HasAnimDictLoaded(animDict)) {
        await new Promise((resolve) => setTimeout(() => resolve(), 100));
    }
}
async function playSmokebombEffect(x, y, z, scale, duration, radius) {
    let playerVisible = true;
    const startTime = GetGameTimer();
    //Trigger smoke effect
    UseParticleFxAssetNextCall('core');
    const smokeParticle = StartParticleFxLoopedAtCoord('exp_grd_grenade_smoke', x, y, z, 0, 0, 0, scale, false, false, false, false);
    //Let the smoke grow for a bit before making Ped invis
    await new Promise((resolve) => setTimeout(() => resolve(), smokePrepTime));
    //While the smoke is active, check where the Ped is in relation to the smoke. Toggle invis based on arbitrary "radius" value
    while (GetGameTimer() - startTime <= duration) {
        const [curX, curY, curZ] = GetEntityCoords(playerPed, true);
        const dist = GetDistanceBetweenCoords(x, y, z, curX, curY, curZ, false);
        if (dist <= radius && playerVisible) {
            SetEntityVisible(playerPed, false, false);
            playerVisible = false;
        }
        else if (dist > radius && !playerVisible) {
            SetEntityVisible(playerPed, true, false);
            playerVisible = true;
        }
        await new Promise((resolve) => setTimeout(() => resolve(), 100));
    }
    if (!playerVisible) {
        SetEntityVisible(playerPed, true, false);
    }
    StopParticleFxLooped(smokeParticle, false);
}
async function throwSmokeBomb() {
    playerCoords = GetEntityCoords(playerPed, true);
    smokeEffectCoords = { x: playerCoords[0], y: playerCoords[1], z: playerCoords[2] - 1.0 };
    //throw smokebomb
    await loadAnimDict(throwAnimDict);
    TaskPlayAnim(playerPed, throwAnimDict, throwAnim, 4.0, -4.0, 300, 0, 0, false, false, false);
    //run smoke function
    await playSmokebombEffect(smokeEffectCoords.x, smokeEffectCoords.y, smokeEffectCoords.z, 1.5, 10000, smokeInvisibleRadius);
}
;
