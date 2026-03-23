import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Geolocation from './Geolocation';
import { useGeolocation } from '../hooks/useGeolocation';
import { describe, it, expect, vi } from 'vitest';

// Mock the useGeolocation hook
vi.mock('../hooks/useGeolocation');

describe('Geolocation component', () => {
    it('should display the button', () => {
        useGeolocation.mockReturnValue({
            location: null,
            loading: false,
            error: null,
            getLocation: vi.fn(),
        });
        render(<Geolocation />);
        expect(screen.getByText('Obtenir la géolocalisation')).toBeInTheDocument();
    });

    it('should call getLocation when the button is clicked', () => {
        const getLocationMock = vi.fn();
        useGeolocation.mockReturnValue({
            location: null,
            loading: false,
            error: null,
            getLocation: getLocationMock,
        });
        render(<Geolocation />);
        fireEvent.click(screen.getByText('Obtenir la géolocalisation'));
        expect(getLocationMock).toHaveBeenCalledTimes(1);
    });

    it('should display loading text when loading', () => {
        useGeolocation.mockReturnValue({
            location: null,
            loading: true,
            error: null,
            getLocation: vi.fn(),
        });
        render(<Geolocation />);
        expect(screen.getByText('Recherche...')).toBeInTheDocument();
    });

    it('should display an error message when there is an error', () => {
        useGeolocation.mockReturnValue({
            location: null,
            loading: false,
            error: 'User denied geolocation',
            getLocation: vi.fn(),
        });
        render(<Geolocation />);
        expect(screen.getByText('Erreur: User denied geolocation')).toBeInTheDocument();
    });

    it('should display location information when available', () => {
        useGeolocation.mockReturnValue({
            location: {
                latitude: 123,
                longitude: 456,
                altitude: 789,
            },
            loading: false,
            error: null,
            getLocation: vi.fn(),
        });
        render(<Geolocation />);
        expect(screen.getByText('Latitude: 123')).toBeInTheDocument();
        expect(screen.getByText('Longitude: 456')).toBeInTheDocument();
        expect(screen.getByText('Altitude: 789')).toBeInTheDocument();
    });
});
