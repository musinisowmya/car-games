import pygame
import random

# Initialize Pygame
pygame.init()

# Set up the game window
WINDOW_WIDTH = 800
WINDOW_HEIGHT = 600
window = pygame.display.set_mode((WINDOW_WIDTH, WINDOW_HEIGHT))
pygame.display.set_caption("Car Racing Game")

# Colors
WHITE = (255, 255, 255)
BLACK = (0, 0, 0)
RED = (255, 0, 0)

# Player car properties
player_car_width = 50
player_car_height = 80
player_x = WINDOW_WIDTH // 2 - player_car_width // 2
player_y = WINDOW_HEIGHT - player_car_height - 20
player_speed = 5

# Obstacle properties
obstacle_width = 50
obstacle_height = 80
obstacle_x = random.randint(0, WINDOW_WIDTH - obstacle_width)
obstacle_y = -obstacle_height
obstacle_speed = 3

# Game loop variables
clock = pygame.time.Clock()
score = 0
game_over = False

# Game loop
running = True
while running:
    # Event handling
    for event in pygame.event.get():
        if event.type == pygame.QUIT:
            running = False
        if event.type == pygame.KEYDOWN:
            if event.key == pygame.K_r and game_over:
                # Reset game
                game_over = False
                score = 0
                obstacle_y = -obstacle_height
                obstacle_x = random.randint(0, WINDOW_WIDTH - obstacle_width)

    if not game_over:
        # Player movement
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] and player_x > 0:
            player_x -= player_speed
        if keys[pygame.K_RIGHT] and player_x < WINDOW_WIDTH - player_car_width:
            player_x += player_speed

        # Move obstacle
        obstacle_y += obstacle_speed
        if obstacle_y > WINDOW_HEIGHT:
            obstacle_y = -obstacle_height
            obstacle_x = random.randint(0, WINDOW_WIDTH - obstacle_width)
            score += 1

        # Collision detection
        player_rect = pygame.Rect(player_x, player_y, player_car_width, player_car_height)
        obstacle_rect = pygame.Rect(obstacle_x, obstacle_y, obstacle_width, obstacle_height)
        
        if player_rect.colliderect(obstacle_rect):
            game_over = True

    # Drawing
    window.fill(WHITE)
    
    # Draw player car
    pygame.draw.rect(window, BLACK, (player_x, player_y, player_car_width, player_car_height))
    
    # Draw obstacle
    pygame.draw.rect(window, RED, (obstacle_x, obstacle_y, obstacle_width, obstacle_height))
    
    # Draw score
    font = pygame.font.Font(None, 36)
    score_text = font.render(f"Score: {score}", True, BLACK)
    window.blit(score_text, (10, 10))
    
    # Draw game over message
    if game_over:
        game_over_text = font.render("Game Over! Press R to Restart", True, BLACK)
        text_rect = game_over_text.get_rect(center=(WINDOW_WIDTH/2, WINDOW_HEIGHT/2))
        window.blit(game_over_text, text_rect)

    pygame.display.update()
    clock.tick(60)

pygame.quit() 