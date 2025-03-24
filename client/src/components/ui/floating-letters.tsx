const animateLetters = () => {
    setFloatingLetters(prevLetters => 
      prevLetters.map(letter => {
        // Move letter upward with slight horizontal drift
        let newY = letter.y - letter.speed;
        let newX = letter.x + (Math.sin(Date.now() * 0.001 + letter.id) * 0.2);

        // If letter moves out of view, restart from bottom
        if (newY < -10) {
          newY = 110;
          return {
            ...letter,
            y: newY,
            x: Math.random() * 100,
            letter: letters[Math.floor(Math.random() * letters.length)],
            speed: 0.1 + Math.random() * 0.3,
            opacity: 0.1 + Math.random() * 0.4,
            size: 12 + Math.random() * 24
          };
        }

        // Rotate letter and adjust opacity based on position
        const newRotation = (letter.rotation + letter.rotationSpeed) % 360;
        const positionBasedOpacity = 0.1 + Math.min(0.7, (letter.y / 100) * 0.7);

        return {
          ...letter,
          y: newY,
          x: newX,
          rotation: newRotation,
          opacity: positionBasedOpacity
        };
      })
    );

    requestAnimationFrame(animateLetters);
  };