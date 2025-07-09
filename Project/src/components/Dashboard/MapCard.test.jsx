import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import MapCard from './MapCard';

// Mock the leaflet library
jest.mock('leaflet', () => ({
  Icon: {
    Default: {
      prototype: {
        _getIconUrl: jest.fn(),
      },
      mergeOptions: jest.fn(),
    },
  },
}));

// Mock the react-leaflet components
jest.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div data-testid="popup">{children}</div>,
  Circle: ({ children }) => <div data-testid="circle">{children}</div>,
  useMapEvents: () => null,
}));

// Mock the location service
jest.mock('../../services/locationService', () => ({
  getBestAvailableLocation: jest.fn(),
  reverseGeocode: jest.fn(),
  riskZones: [],
  emergencyFacilities: [],
}));

// Mock the responsive utility
jest.mock('../../utils/responsive', () => ({
  responsiveClasses: {
    card: 'card-class',
    cardHeader: 'card-header-class',
    cardPadding: 'card-padding-class',
    textBase: 'text-base-class',
    textSm: 'text-sm-class',
    textXs: 'text-xs-class',
    iconSm: 'icon-sm-class',
    iconXl: 'icon-xl-class',
    btnMd: 'btn-md-class',
  },
  cn: (...classes) => classes.filter(Boolean).join(' '),
}));

// Mock geolocation API
const mockGeolocation = {
  getCurrentPosition: jest.fn(),
  watchPosition: jest.fn(),
  clearWatch: jest.fn(),
};

Object.defineProperty(navigator, 'geolocation', {
  value: mockGeolocation,
  writable: true,
});

Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true,
});

describe('MapCard Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders map card with loading state', () => {
    render(<MapCard />);
    
    expect(screen.getByText('Map View')).toBeInTheDocument();
    expect(screen.getByText('Getting your location...')).toBeInTheDocument();
  });

  test('shows offline indicator when network is unavailable', async () => {
    // Mock navigator.onLine to false
    Object.defineProperty(navigator, 'onLine', {
      value: false,
      writable: true,
    });

    render(<MapCard />);

    await waitFor(() => {
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  test('displays error message when location fails', async () => {
    const locationService = require('../../services/locationService');
    locationService.getBestAvailableLocation.mockRejectedValue(
      new Error('Location permission denied')
    );

    render(<MapCard />);

    await waitFor(() => {
      expect(screen.getByText(/Location permission denied/)).toBeInTheDocument();
    });
  });

  test('shows fallback location when geolocation is not supported', async () => {
    // Mock geolocation as not supported
    Object.defineProperty(navigator, 'geolocation', {
      value: undefined,
      writable: true,
    });

    render(<MapCard />);

    await waitFor(() => {
      expect(screen.getByText(/Geolocation is not supported/)).toBeInTheDocument();
    });
  });

  test('refresh button triggers location update', async () => {
    const locationService = require('../../services/locationService');
    locationService.getBestAvailableLocation.mockResolvedValue({
      lat: 26.2183,
      lng: 78.1828,
      accuracy: 50,
    });

    render(<MapCard />);

    // Wait for initial load
    await waitFor(() => {
      expect(screen.queryByText('Getting your location...')).not.toBeInTheDocument();
    });

    // Click refresh button
    const refreshButton = screen.getByTitle('Refresh location');
    fireEvent.click(refreshButton);

    expect(locationService.getBestAvailableLocation).toHaveBeenCalledTimes(2);
  });

  test('displays location accuracy when available', async () => {
    const locationService = require('../../services/locationService');
    locationService.getBestAvailableLocation.mockResolvedValue({
      lat: 26.2183,
      lng: 78.1828,
      accuracy: 25,
    });

    render(<MapCard />);

    await waitFor(() => {
      expect(screen.getByText('Accuracy: ±25m')).toBeInTheDocument();
    });
  });
});
