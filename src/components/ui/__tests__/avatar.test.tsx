import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Avatar, AvatarImage, AvatarFallback } from '../avatar'

describe('Avatar Components', () => {
  const imageSrc = 'https://example.com/avatar.jpg'
  const fallbackText = 'MF'

  it('should display the AvatarFallback when the image is not available', () => {
    render(
      <Avatar>
        <AvatarImage src={imageSrc} alt="User's avatar" />
        <AvatarFallback>{fallbackText}</AvatarFallback>
      </Avatar>,
    )

    // In JSDOM, images do not load, so the fallback should be visible immediately.
    expect(screen.getByText(fallbackText)).toBeInTheDocument()
    // The img role may not be present if the image fails to load.
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('should apply custom classNames to all components', () => {
    render(
      <Avatar data-testid="avatar" className="custom-avatar">
        <AvatarImage
          src={imageSrc}
          alt="User's avatar"
          className="custom-image"
        />
        <AvatarFallback className="custom-fallback">{fallbackText}</AvatarFallback>
      </Avatar>,
    )

    // Check classes on the root and fallback elements
    expect(screen.getByTestId('avatar')).toHaveClass('custom-avatar')
    expect(screen.getByText(fallbackText)).toHaveClass('custom-fallback')
  })
})
