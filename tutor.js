function draw(ctx) {
    ctx.fillRect(0, 0, 150, 150); // Draw a Black rectangle with default settings
    ctx.save(); // Save the original default state

    ctx.fillStyle = "#09F"; // Make changes to saved settings
    ctx.fillRect(15, 15, 120, 120); // Draw a Blue rectangle with new settings
    ctx.save(); // Save the current state

    ctx.fillStyle = "#FFF"; // Make changes to saved settings
    ctx.globalAlpha = 0.5;
    ctx.fillRect(30, 30, 90, 90); // Draw a 50%-White rectangle with newest settings

    ctx.restore(); // Restore to previous state
    ctx.fillRect(45, 45, 60, 60); // Draw a rectangle with restored Blue setting

    ctx.restore(); // Restore to original state
    ctx.fillRect(60, 60, 30, 30); // Draw a rectangle with restored Black setting
}