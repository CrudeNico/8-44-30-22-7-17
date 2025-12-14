// Handle dropdown image preview switching
document.addEventListener('DOMContentLoaded', function() {
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    
    dropdownItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            const previewId = this.getAttribute('data-preview');
            const dropdownMenu = this.closest('.dropdown-menu');
            const previewImages = dropdownMenu.querySelectorAll('.preview-image');
            
            // Remove active class from all images in this dropdown
            previewImages.forEach(img => {
                img.classList.remove('active');
            });
            
            // Add active class to the matching image
            const targetImage = dropdownMenu.querySelector(`.preview-image[data-item="${previewId}"]`);
            if (targetImage) {
                targetImage.classList.add('active');
            }
        });
    });
    
    // Hero background image fade on scroll
    const heroSection = document.querySelector('.hero');
    if (heroSection) {
        function handleScroll() {
            const scrollPosition = window.scrollY;
            const heroHeight = heroSection.offsetHeight;
            // Start fading when scrolled past 30% of hero section
            const fadeStart = heroHeight * 0.3;
            // Complete fade when scrolled past 80% of hero section
            const fadeEnd = heroHeight * 0.8;
            
            let opacity = 1;
            if (scrollPosition <= fadeStart) {
                // Fully visible at top
                opacity = 1;
            } else if (scrollPosition >= fadeEnd) {
                // Fully faded
                opacity = 0;
            } else {
                // Fade between fadeStart and fadeEnd
                const fadeProgress = (scrollPosition - fadeStart) / (fadeEnd - fadeStart);
                opacity = 1 - fadeProgress;
            }
            
            // Apply opacity to the ::before pseudo-element (background image)
            heroSection.style.setProperty('--hero-bg-opacity', opacity);
        }
        
        // Use CSS custom property to control ::before opacity
        const style = document.createElement('style');
        style.textContent = `
            .hero::before {
                opacity: var(--hero-bg-opacity, 1);
            }
        `;
        document.head.appendChild(style);
        
        // Initial check
        handleScroll();
        
        // Listen to scroll events
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Recalculate on resize
        window.addEventListener('resize', handleScroll, { passive: true });
    }
    
    // Video fade-in on scroll with auto-play
    const heroMedia = document.querySelector('.hero-media');
    const heroVideo = document.getElementById('hero-video');
    
    if (heroMedia && heroVideo) {
        // Ensure video is muted for autoplay
        heroVideo.muted = true;
        
        const videoObserverOptions = {
            threshold: 0.2,
            rootMargin: '200px 0px 0px 0px' // Start fading in 200px before it enters viewport
        };

        const videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Start playing video when it becomes visible
                    heroVideo.play().catch(function(error) {
                        console.log('Autoplay prevented:', error);
                    });
                }
            });
        }, videoObserverOptions);

        videoObserver.observe(heroMedia);
    }
    
    // Feature tabs functionality
    const featureTabs = document.querySelectorAll('.feature-tab');
    const featurePanels = document.querySelectorAll('.feature-panel');
    let currentTabIndex = 0;
    let autoRotateInterval;
    
    function switchTab(index) {
        // Remove active class from all tabs and panels
        featureTabs.forEach(tab => tab.classList.remove('active'));
        featurePanels.forEach(panel => panel.classList.remove('active'));
        
        // Add active class to selected tab and panel
        featureTabs[index].classList.add('active');
        featurePanels[index].classList.add('active');
        
        currentTabIndex = index;
    }
    
    // Tab click handlers
    featureTabs.forEach((tab, index) => {
        tab.addEventListener('click', function() {
            switchTab(index);
            // Reset auto-rotate timer
            clearInterval(autoRotateInterval);
            startAutoRotate();
        });
    });
    
    // Auto-rotate function
    function startAutoRotate() {
        autoRotateInterval = setInterval(function() {
            currentTabIndex = (currentTabIndex + 1) % featureTabs.length;
            switchTab(currentTabIndex);
        }, 5000); // 5 seconds
    }
    
    // Start auto-rotate
    startAutoRotate();

    // Services slider controls - continuous smooth scrolling
    const servicesSlider = document.querySelector('.services-slider');
    if (servicesSlider) {
        const servicesTrack = servicesSlider.querySelector('.services-track');
        const serviceCards = servicesSlider.querySelectorAll('.service-card');
        const prevServiceBtn = servicesSlider.querySelector('.service-arrow--prev');
        const nextServiceBtn = servicesSlider.querySelector('.service-arrow--next');
        
        let scrollPosition = 0;
        let animationFrameId = null;
        let isPaused = false;
        let scrollSpeed = 0.5; // pixels per frame (adjust for speed)
        let loopWidth = 0;

        const getGap = () => {
            const styles = getComputedStyle(servicesTrack);
            return parseFloat(styles.columnGap || styles.gap || 0);
        };

        const getCardWidth = () => {
            if (serviceCards.length === 0) return 0;
            return serviceCards[0].offsetWidth;
        };

        const calculateLoopWidth = () => {
            const cardWidth = getCardWidth();
            const gap = getGap();
            // Calculate width of one set of cards (first 5)
            return (cardWidth + gap) * 5; // 5 original cards
        };

        const updateScrollPosition = () => {
            if (isPaused) {
                animationFrameId = requestAnimationFrame(updateScrollPosition);
                return;
            }

            scrollPosition += scrollSpeed;
            loopWidth = calculateLoopWidth();

            // When we've scrolled one full set, reset to 0 seamlessly
            if (scrollPosition >= loopWidth) {
                scrollPosition = scrollPosition - loopWidth;
            }

            servicesTrack.style.transform = `translateX(${-scrollPosition}px)`;
            animationFrameId = requestAnimationFrame(updateScrollPosition);
        };

        // Pause on hover
        servicesSlider.addEventListener('mouseenter', () => {
            isPaused = true;
        });

        servicesSlider.addEventListener('mouseleave', () => {
            isPaused = false;
        });

        // Manual controls (optional - can be removed if not needed)
        if (prevServiceBtn) {
            prevServiceBtn.style.display = 'none'; // Hide since we're auto-scrolling
        }

        if (nextServiceBtn) {
            nextServiceBtn.style.display = 'none'; // Hide since we're auto-scrolling
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            // Recalculate on resize
            loopWidth = calculateLoopWidth();
        });

        // Start continuous scrolling
        updateScrollPosition();
    }

    // Scroll fade-in animations
    const fadeInSections = document.querySelectorAll('.fade-in-section');
    
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const fadeInObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                // Optional: Unobserve after animation to improve performance
                fadeInObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    fadeInSections.forEach(section => {
        fadeInObserver.observe(section);
    });

    // Timeline items fade-in on scroll
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        const timelineObserverOptions = {
            threshold: 0.2,
            rootMargin: '0px 0px -50px 0px'
        };

        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Don't unobserve so items can fade in again if scrolled back
                }
            });
        }, timelineObserverOptions);

        timelineItems.forEach((item, index) => {
            // Add a slight delay for staggered effect
            item.style.transitionDelay = `${index * 0.1}s`;
            timelineObserver.observe(item);
        });
    }

    // Fade-in items (bullet points) on scroll
    const fadeInItems = document.querySelectorAll('.fade-in-item');
    if (fadeInItems.length > 0) {
        const itemObserverOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const itemObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, itemObserverOptions);

        fadeInItems.forEach((item, index) => {
            // Add staggered delay for sequential appearance
            item.style.transitionDelay = `${index * 0.15}s`;
            itemObserver.observe(item);
        });
    }

    // Consultation Calendar Widget
    const consultationSection = document.querySelector('.consultation-section');
    if (consultationSection) {
        const calendarDays = document.getElementById('calendar-days');
        const currentMonthEl = document.getElementById('current-month');
        const prevMonthBtn = document.getElementById('prev-month');
        const nextMonthBtn = document.getElementById('next-month');
        const dateSelectionView = document.getElementById('date-selection-view');
        const bookingFormView = document.getElementById('booking-form-view');
        const consultationLeft = document.getElementById('consultation-left');
        const selectedDateDisplay = document.getElementById('selected-date-display');
        const timeSlotsGrid = document.getElementById('time-slots-grid');
        const backToCalendarBtn = document.getElementById('back-to-calendar-arrow');
        const bookingForm = document.getElementById('booking-form');
        
        let currentDate = new Date(2025, 10, 1); // November 2025
        let selectedDate = null;
        let selectedTime = null;
        
        // Define unavailable dates (to make calendar look busy)
        // Format: 'YYYY-MM-DD'
        const unavailableDates = new Set([
            '2025-11-1', '2025-11-2', '2025-11-3', '2025-11-5', '2025-11-7',
            '2025-11-8', '2025-11-10', '2025-11-12', '2025-11-13', '2025-11-15',
            '2025-11-16', '2025-11-18', '2025-11-20', '2025-11-21', '2025-11-23',
            '2025-11-25', '2025-11-26', '2025-11-28', '2025-11-30',
            '2025-12-1', '2025-12-3', '2025-12-5', '2025-12-7', '2025-12-9',
            '2025-12-11', '2025-12-13', '2025-12-15', '2025-12-17', '2025-12-19',
            '2025-12-21', '2025-12-23', '2025-12-25', '2025-12-27', '2025-12-29',
            '2025-10-2', '2025-10-4', '2025-10-6', '2025-10-8', '2025-10-10',
            '2025-10-12', '2025-10-14', '2025-10-16', '2025-10-18', '2025-10-20'
        ]);

        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        function renderCalendar() {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            
            currentMonthEl.textContent = `${monthNames[month]} ${year}`;
            
            // Get first day of month and number of days
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const daysInPrevMonth = new Date(year, month, 0).getDate();
            
            calendarDays.innerHTML = '';
            
            // Previous month's days
            for (let i = firstDay - 1; i >= 0; i--) {
                const day = daysInPrevMonth - i;
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day other-month';
                dayEl.textContent = day;
                calendarDays.appendChild(dayEl);
            }
            
            // Current month's days
            for (let day = 1; day <= daysInMonth; day++) {
                const dayEl = document.createElement('div');
                const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const isUnavailable = unavailableDates.has(dateKey);
                
                if (isUnavailable) {
                    dayEl.className = 'calendar-day unavailable';
                } else {
                    dayEl.className = 'calendar-day available';
                }
                
                // Check if this is the selected date
                if (selectedDate && year === selectedDate.getFullYear() && 
                    month === selectedDate.getMonth() && 
                    day === selectedDate.getDate() && !isUnavailable) {
                    dayEl.classList.add('selected');
                }
                
                dayEl.textContent = day;
                
                if (!isUnavailable) {
                    dayEl.addEventListener('click', () => {
                        // Remove selected from all days
                        document.querySelectorAll('.calendar-day').forEach(d => {
                            d.classList.remove('selected');
                        });
                        // Add selected to clicked day
                        dayEl.classList.add('selected');
                        selectedDate = new Date(year, month, day);
                        // Switch to booking form view
                        showBookingForm();
                    });
                }
                
                calendarDays.appendChild(dayEl);
            }
            
            // Fill remaining cells
            const totalCells = calendarDays.children.length;
            const remainingCells = 42 - totalCells; // 6 rows * 7 days
            for (let day = 1; day <= remainingCells; day++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'calendar-day other-month';
                dayEl.textContent = day;
                calendarDays.appendChild(dayEl);
            }
        }

        prevMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() - 1);
            renderCalendar();
        });

        nextMonthBtn.addEventListener('click', () => {
            currentDate.setMonth(currentDate.getMonth() + 1);
            renderCalendar();
        });

        // Generate time slots (9 AM to 5 PM, 30-minute intervals)
        function generateTimeSlots() {
            const slots = [];
            const startHour = 9;
            const endHour = 17;
            
            for (let hour = startHour; hour < endHour; hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const timeString = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                    // Randomly mark some slots as unavailable (to make it look busy)
                    const isUnavailable = Math.random() < 0.3;
                    slots.push({ time: timeString, unavailable: isUnavailable });
                }
            }
            return slots;
        }

        function renderTimeSlots() {
            const slots = generateTimeSlots();
            timeSlotsGrid.innerHTML = '';
            
            slots.forEach(slot => {
                const slotEl = document.createElement('button');
                slotEl.type = 'button';
                slotEl.className = slot.unavailable ? 'time-slot unavailable' : 'time-slot';
                slotEl.textContent = slot.time;
                slotEl.disabled = slot.unavailable;
                
                if (!slot.unavailable) {
                    slotEl.addEventListener('click', () => {
                        // Remove selected from all slots
                        document.querySelectorAll('.time-slot').forEach(s => {
                            s.classList.remove('selected');
                        });
                        // Add selected to clicked slot
                        slotEl.classList.add('selected');
                        selectedTime = slot.time;
                    });
                }
                
                timeSlotsGrid.appendChild(slotEl);
            });
        }

        function showBookingForm() {
            if (!selectedDate) return;
            
            const monthNames = [
                'January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'
            ];
            
            const dateString = `${monthNames[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`;
            selectedDateDisplay.textContent = dateString;
            
            // Hide left panel and date selection, show booking form
            if (consultationLeft) consultationLeft.style.display = 'none';
            dateSelectionView.style.display = 'none';
            bookingFormView.style.display = 'block';
            
            // Make booking form view full width
            const consultationContent = bookingFormView.closest('.consultation-content');
            if (consultationContent) {
                consultationContent.classList.add('full-width');
            }
            
            // Generate time slots
            renderTimeSlots();
        }

        function showDateSelection() {
            // Show left panel and date selection, hide booking form
            if (consultationLeft) consultationLeft.style.display = 'block';
            dateSelectionView.style.display = 'block';
            bookingFormView.style.display = 'none';
            selectedTime = null;
            
            // Reset grid layout
            const consultationContent = bookingFormView.closest('.consultation-content');
            if (consultationContent) {
                consultationContent.classList.remove('full-width');
            }
        }

        // Back button handler
        if (backToCalendarBtn) {
            backToCalendarBtn.addEventListener('click', () => {
                showDateSelection();
            });
        }

        // Form submission handler
        if (bookingForm) {
            bookingForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                if (!selectedTime) {
                    alert('Please select a time slot');
                    return;
                }
                
                const consultationTopic = formData.get('consultationTopic');
                if (!consultationTopic) {
                    alert('Please select a consultation topic');
                    return;
                }
                
                const formData = new FormData(bookingForm);
                const bookingData = {
                    date: selectedDate,
                    time: selectedTime,
                    consultationTopic: formData.get('consultationTopic'),
                    fullName: formData.get('fullName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    country: formData.get('country'),
                    company: formData.get('company'),
                    notes: formData.get('notes')
                };
                
                // Here you would typically send the data to a server
                console.log('Booking data:', bookingData);
                alert('Booking confirmed! You will receive a confirmation email shortly.');
                
                // Reset form
                bookingForm.reset();
                showDateSelection();
                selectedDate = null;
                selectedTime = null;
            });
        }

        // Initial render
        renderCalendar();
    }
});

// Toggle job requirements
function toggleRequirements(button) {
    const jobCard = button.closest('.job-card');
    const requirements = jobCard.querySelector('.job-requirements');
    
    if (requirements.style.display === 'none') {
        requirements.style.display = 'block';
        button.textContent = 'Hide Requirements';
    } else {
        requirements.style.display = 'none';
        button.textContent = 'Requirements';
    }
}

// Investment Calculator functionality
document.addEventListener('DOMContentLoaded', function() {
    const calculatorForm = document.getElementById('calculator-form');
    if (calculatorForm) {

        // Years slider
        const yearsSlider = document.getElementById('years');
        const yearsDisplay = document.getElementById('years-display');
        if (yearsSlider && yearsDisplay) {
            // Set initial display value
            yearsDisplay.textContent = yearsSlider.value;
            yearsSlider.addEventListener('input', function() {
                yearsDisplay.textContent = this.value;
                calculateInvestment();
            });
        }

        // Initial investment slider
        const initialInvestmentSlider = document.getElementById('initial-investment');
        const initialInvestmentDisplay = document.getElementById('initial-investment-display');
        if (initialInvestmentSlider && initialInvestmentDisplay) {
            // Set initial display value
            initialInvestmentDisplay.textContent = formatCurrency(parseFloat(initialInvestmentSlider.value));
            initialInvestmentSlider.addEventListener('input', function() {
                initialInvestmentDisplay.textContent = formatCurrency(parseFloat(this.value));
                calculateInvestment();
            });
        }

        // Recurring amount slider
        const recurringAmountSlider = document.getElementById('recurring-amount');
        const recurringAmountDisplay = document.getElementById('recurring-amount-display');
        if (recurringAmountSlider && recurringAmountDisplay) {
            // Set initial display value
            recurringAmountDisplay.textContent = formatCurrency(parseFloat(recurringAmountSlider.value));
            recurringAmountSlider.addEventListener('input', function() {
                recurringAmountDisplay.textContent = formatCurrency(parseFloat(this.value));
                calculateInvestment();
            });
        }

        // Recurring frequency radio buttons
        const recurringFrequencyRadios = document.querySelectorAll('input[name="recurringFrequency"]');
        recurringFrequencyRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                calculateInvestment();
            });
        });

        // Share button functionality
        const shareBtn = document.getElementById('share-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', function() {
                if (navigator.share) {
                    const shareData = {
                        title: 'Investment Calculator - Opessocius',
                        text: 'Check out my investment projection!',
                        url: window.location.href
                    };
                    navigator.share(shareData).catch(err => console.log('Error sharing:', err));
                } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Link copied to clipboard!');
                    });
                }
            });
        }

        // Download PDF button functionality
        const downloadBtn = document.getElementById('download-btn');
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                generatePDF();
            });
        }

        // Rate of return radio buttons
        const rateRadios = document.querySelectorAll('input[name="rateOfReturn"]');
        rateRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                calculateInvestment();
            });
        });

        // Collapsible information sections
        const infoSectionToggles = document.querySelectorAll('.info-section-toggle');
        infoSectionToggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                const content = this.nextElementSibling;
                
                // Toggle aria-expanded
                this.setAttribute('aria-expanded', !isExpanded);
                
                // Toggle content visibility
                if (isExpanded) {
                    content.style.display = 'none';
                } else {
                    content.style.display = 'block';
                }
            });
        });

        // Initial calculation
        calculateInvestment();
    }

    // Chart full page expand functionality
    const chartExpandBtn = document.getElementById('chart-expand-btn');
    const chartOverlay = document.getElementById('chart-overlay');
    const chartCloseBtn = document.getElementById('chart-close-btn');
    
    if (chartExpandBtn && chartOverlay) {
        chartExpandBtn.addEventListener('click', function() {
            chartOverlay.style.display = 'flex';
            // Redraw chart in full size
            setTimeout(() => {
                const canvasFull = document.getElementById('growth-chart-full');
                if (canvasFull) {
                    const canvas = document.getElementById('growth-chart');
                    const form = document.getElementById('calculator-form');
                    if (form) {
                        const initialInvestment = parseFloat(document.getElementById('initial-investment').value) || 0;
                        const years = parseFloat(document.getElementById('years').value) || 0;
                        const rateOfReturnRadio = document.querySelector('input[name="rateOfReturn"]:checked');
                        const monthlyGrowthRate = parseFloat(rateOfReturnRadio ? rateOfReturnRadio.value : 2) / 100; // 2% or 4% monthly rate
                        const recurringAmount = parseFloat(document.getElementById('recurring-amount').value) || 0;
                        const recurringFrequencyRadio = document.querySelector('input[name="recurringFrequency"]:checked');
                        const recurringFrequency = parseFloat(recurringFrequencyRadio ? recurringFrequencyRadio.value : 12) || 12;
                        
                        const totalMonths = years * 12;
                        const monthsPerContribution = recurringFrequency === 12 ? 1 : (recurringFrequency === 4 ? 3 : 12);
                        
                        let balance = initialInvestment;
                        const growthData = [];
                        const simpleGrowthData = [];
                        let totalContributions = initialInvestment;
                        let simplePrincipal = initialInvestment;
                        let simpleBalance = initialInvestment;
                        
                        growthData.push({ year: 0, month: 0, balance: balance, contributions: totalContributions });
                        simpleGrowthData.push({ year: 0, month: 0, balance: simpleBalance });
                        
                        for (let month = 1; month <= totalMonths; month++) {
                            // Step 1: Apply monthly growth rate (compounding)
                            if (monthlyGrowthRate > 0) {
                                balance = balance * (1 + monthlyGrowthRate);
                            }
                            
                            // Step 2: Add recurring contribution after growth
                            if (recurringAmount > 0 && month % monthsPerContribution === 0) {
                                balance += recurringAmount;
                                totalContributions += recurringAmount;
                            }
                            
                            // Calculate simple interest (no compounding on prior interest)
                            if (monthlyGrowthRate > 0) {
                                const simpleInterestEarned = simplePrincipal * monthlyGrowthRate;
                                simpleBalance += simpleInterestEarned;
                            }
                            if (recurringAmount > 0 && month % monthsPerContribution === 0) {
                                simplePrincipal += recurringAmount;
                                simpleBalance += recurringAmount;
                            }
                            
                            // Record yearly balances (Month 0, 12, 24, 36, etc.)
                            if (month % 12 === 0 || month === totalMonths) {
                                const year = month / 12;
                                growthData.push({ year: year, month: month, balance: balance, contributions: totalContributions });
                                simpleGrowthData.push({ year: year, month: month, balance: simpleBalance });
                            }
                        }
                        
                        drawGrowthChartFull(canvasFull, growthData, simpleGrowthData, years);
                        attachFullChartTooltip(canvasFull);
                    }
                }
            }, 100);
        });
    }
    
    if (chartCloseBtn && chartOverlay) {
        chartCloseBtn.addEventListener('click', function() {
            chartOverlay.style.display = 'none';
            const canvasFull = document.getElementById('growth-chart-full');
            if (canvasFull && canvasFull._tooltipEl) {
                canvasFull._tooltipEl.style.display = 'none';
            }
        });
    }
    
    // Close on overlay click
    if (chartOverlay) {
        chartOverlay.addEventListener('click', function(e) {
            if (e.target === chartOverlay) {
                chartOverlay.style.display = 'none';
                const canvasFull = document.getElementById('growth-chart-full');
                if (canvasFull && canvasFull._tooltipEl) {
                    canvasFull._tooltipEl.style.display = 'none';
                }
            }
        });
    }

    // Table full page expand functionality
    const tableExpandBtn = document.getElementById('table-expand-btn');
    const tableOverlay = document.getElementById('table-overlay');
    const tableCloseBtn = document.getElementById('table-close-btn');
    
    if (tableExpandBtn && tableOverlay) {
        tableExpandBtn.addEventListener('click', function() {
            tableOverlay.style.display = 'flex';
            // Show all years in full page table (up to Year 10 visible, rest scrollable)
            const tableBodyFull = document.getElementById('balance-table-body-full');
            if (tableBodyFull && window.fullYearlyBalanceData) {
                tableBodyFull.innerHTML = '';
                window.fullYearlyBalanceData.forEach((point) => {
                    const row = document.createElement('tr');
                    const yearCell = document.createElement('td');
                    const balanceCell = document.createElement('td');
                    
                    yearCell.textContent = Math.round(point.year) === 0 ? 'Now' : `Year ${Math.round(point.year)}`;
                    balanceCell.textContent = formatCurrency(point.balance);
                    
                    row.appendChild(yearCell);
                    row.appendChild(balanceCell);
                    tableBodyFull.appendChild(row);
                });
            }
        });
    }
    
    if (tableCloseBtn && tableOverlay) {
        tableCloseBtn.addEventListener('click', function() {
            tableOverlay.style.display = 'none';
        });
    }
    
    // Close on overlay click
    if (tableOverlay) {
        tableOverlay.addEventListener('click', function(e) {
            if (e.target === tableOverlay) {
                tableOverlay.style.display = 'none';
            }
        });
    }
});

function calculateInvestment() {
    const form = document.getElementById('calculator-form');
    if (!form) return;

    const initialInvestment = parseFloat(document.getElementById('initial-investment').value) || 0;
    const years = parseFloat(document.getElementById('years').value) || 0;
    const rateOfReturnRadio = document.querySelector('input[name="rateOfReturn"]:checked');
    const monthlyGrowthRate = parseFloat(rateOfReturnRadio ? rateOfReturnRadio.value : 2) / 100; // 2% or 4% monthly rate
    const recurringAmount = parseFloat(document.getElementById('recurring-amount').value) || 0;
    const recurringFrequencyRadio = document.querySelector('input[name="recurringFrequency"]:checked');
    const recurringFrequency = parseFloat(recurringFrequencyRadio ? recurringFrequencyRadio.value : 12) || 12;

    // Convert years to months
    const totalMonths = years * 12;

    // Calculate how often to add recurring contribution (in months)
    // Monthly = every 1 month, Quarterly = every 3 months, Yearly = every 12 months
    const monthsPerContribution = recurringFrequency === 12 ? 1 : (recurringFrequency === 4 ? 3 : 12);

    // Calculate final balance with monthly compounding
    let balance = initialInvestment;
    const growthData = [];
    const simpleGrowthData = [];
    let totalContributions = initialInvestment;
    let simplePrincipal = initialInvestment;
    let simpleBalance = initialInvestment;

    // Record initial balance (Month 0)
    growthData.push({
        year: 0,
        month: 0,
        balance: balance,
        contributions: totalContributions
    });

    simpleGrowthData.push({
        year: 0,
        month: 0,
        balance: simpleBalance
    });

    for (let month = 1; month <= totalMonths; month++) {
        // Step 1: Apply monthly growth rate (compounding)
        if (monthlyGrowthRate > 0) {
            balance = balance * (1 + monthlyGrowthRate);
        }

        // Step 2: Add recurring contribution after growth (if applicable)
        if (recurringAmount > 0 && month % monthsPerContribution === 0) {
            balance += recurringAmount;
            totalContributions += recurringAmount;
        }

        // Calculate simple-interest projection (no compounding on prior interest)
        if (monthlyGrowthRate > 0) {
            const simpleInterestEarned = simplePrincipal * monthlyGrowthRate;
            simpleBalance += simpleInterestEarned;
        }
        if (recurringAmount > 0 && month % monthsPerContribution === 0) {
            simplePrincipal += recurringAmount;
            simpleBalance += recurringAmount;
        }

        // Record yearly balances (Month 0, 12, 24, 36, etc.)
        if (month % 12 === 0 || month === totalMonths) {
            const year = month / 12;
            growthData.push({
                year: year,
                month: month,
                balance: balance,
                contributions: totalContributions
            });
            simpleGrowthData.push({
                year: year,
                month: month,
                balance: simpleBalance
            });
        }
    }

    const finalBalance = balance;
    const interestEarned = finalBalance - totalContributions;

    // Update display
    document.getElementById('final-balance').textContent = formatCurrency(finalBalance);
    document.getElementById('total-contributions').textContent = formatCurrency(totalContributions);
    document.getElementById('interest-earned').textContent = formatCurrency(interestEarned);

    // Draw chart
    drawGrowthChart(growthData, simpleGrowthData, years);
    
    // Update yearly balance table
    updateYearlyBalanceTable(growthData);
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function drawGrowthChart(data, simpleData, years) {
    const canvas = document.getElementById('growth-chart');
    if (!canvas) return;

    // Make canvas responsive
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth - 48; // Account for padding
    const aspectRatio = 600 / 300;
    canvas.width = containerWidth;
    canvas.height = containerWidth / aspectRatio;
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = (containerWidth / aspectRatio) + 'px';

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 40, right: 40, bottom: 60, left: 60 };

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find max balance for scaling (include both datasets)
    const maxBalance = Math.max(
        ...data.map(d => d.balance),
        ...simpleData.map(d => d.balance)
    );
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }

    // Draw bars
    const barWidth = chartWidth / data.length * 0.8;
    const barSpacing = chartWidth / data.length * 0.2;
    const maxBarHeight = chartHeight;

    // Add roundRect polyfill if needed
    if (!CanvasRenderingContext2D.prototype.roundRect) {
        CanvasRenderingContext2D.prototype.roundRect = function(x, y, width, height, radius) {
            this.beginPath();
            this.moveTo(x + radius, y);
            this.lineTo(x + width - radius, y);
            this.quadraticCurveTo(x + width, y, x + width, y + radius);
            this.lineTo(x + width, y + height - radius);
            this.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
            this.lineTo(x + radius, y + height);
            this.quadraticCurveTo(x, y + height, x, y + height - radius);
            this.lineTo(x, y + radius);
            this.quadraticCurveTo(x, y, x + radius, y);
            this.closePath();
        };
    }

    const lastX = padding.left + chartWidth;
    const lastY = padding.top + maxBarHeight;
    const firstX = padding.left;
    const firstY = padding.top + maxBarHeight;

    // Draw simple interest reference line (grey, no fill)
    ctx.save();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 2;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    simpleData.forEach((point, index) => {
        const x = padding.left + (index / (simpleData.length - 1)) * chartWidth;
        const y = padding.top + maxBarHeight - ((point.balance / maxBalance) * maxBarHeight);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    ctx.restore();

    // Draw compound interest line (blue) with shaded area
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 3;
    ctx.fillStyle = 'rgba(30, 64, 175, 0.1)';
    
    // Draw the line and create path for area fill
    ctx.beginPath();
    data.forEach((point, index) => {
        const x = padding.left + (index / (data.length - 1)) * chartWidth;
        const y = padding.top + maxBarHeight - ((point.balance / maxBalance) * maxBarHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    // Complete the area path by going to bottom corners
    ctx.lineTo(lastX, lastY);
    ctx.lineTo(firstX, firstY);
    ctx.closePath();
    
    // Fill the area
    ctx.fill();
    
    // Draw the line on top
    ctx.beginPath();
    data.forEach((point, index) => {
        const x = padding.left + (index / (data.length - 1)) * chartWidth;
        const y = padding.top + maxBarHeight - ((point.balance / maxBalance) * maxBarHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    
    // Draw data points for compound interest
    ctx.fillStyle = '#1e40af';
    data.forEach((point, index) => {
        const x = padding.left + (index / (data.length - 1)) * chartWidth;
        const y = padding.top + maxBarHeight - ((point.balance / maxBalance) * maxBarHeight);
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw axes labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '12px Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // X-axis labels (years)
    const labelInterval = Math.max(1, Math.floor(data.length / 3));
    data.forEach((point, index) => {
        if (index % labelInterval === 0 || index === data.length - 1) {
            const x = padding.left + (index / (data.length - 1)) * chartWidth;
            const label = point.year === 0 ? 'Now' : Math.round(point.year).toString();
            ctx.fillText(label, x, height - padding.bottom + 10);
        }
    });

    // Y-axis labels (balance)
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= gridLines; i++) {
        const value = maxBalance * (1 - i / gridLines);
        const y = padding.top + (chartHeight / gridLines) * i;
        const label = formatCurrency(value);
        ctx.fillText(label, padding.left - 10, y);
    }
}

function updateYearlyBalanceTable(data) {
    const tableBody = document.getElementById('balance-table-body');
    if (!tableBody) return;
    
    // Clear existing rows
    tableBody.innerHTML = '';
    
    // Show only first 3 years (plus "Now" = year 0) in the default view
    // Full screen will show all years
    const maxYearsToShow = 4; // "Now" (0) + Years 1, 2, 3
    
    // Add rows for each year (limited to first 3 years)
    data.forEach((point, index) => {
        if (index < maxYearsToShow) {
            const row = document.createElement('tr');
            const yearCell = document.createElement('td');
            const balanceCell = document.createElement('td');
            
            yearCell.textContent = Math.round(point.year) === 0 ? 'Now' : `Year ${Math.round(point.year)}`;
            balanceCell.textContent = formatCurrency(point.balance);
            
            row.appendChild(yearCell);
            row.appendChild(balanceCell);
            tableBody.appendChild(row);
        }
    });
    
    // Store full data for full screen view
    window.fullYearlyBalanceData = data;
}

function generatePDF() {
    // Check if jsPDF is available
    if (typeof window.jspdf === 'undefined') {
        alert('PDF library is loading. Please try again in a moment.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // Portrait, millimeters, A4 size
    
    // PDF Layout Configuration - Customize these values to adjust positioning
    const config = {
        // Margins
        marginTop: 20,
        marginLeft: 20,
        marginRight: 20,
        marginBottom: 20,
        
        // Header
        headerY: 20,
        headerFontSize: 24,
        headerSpacing: 10,
        
        // Section spacing (increased for better readability)
        sectionSpacing: 20,
        sectionHeaderSpacing: 8, // Space after section header
        lineHeight: 7,
        
        // Colors (RGB values 0-255)
        primaryColor: [13, 37, 89], // Dark blue for graphs/charts only
        textColor: [0, 0, 0], // Black for text
        lightGray: [229, 231, 235], // Light gray for borders
    };
    
    let currentY = config.marginTop;
    
    // Get current investment data
    const initialInvestment = parseFloat(document.getElementById('initial-investment').value) || 0;
    const years = parseFloat(document.getElementById('years').value) || 0;
    const rateOfReturnRadio = document.querySelector('input[name="rateOfReturn"]:checked');
    const rateOfReturn = parseFloat(rateOfReturnRadio ? rateOfReturnRadio.value : 2) || 2;
    const recurringAmount = parseFloat(document.getElementById('recurring-amount').value) || 0;
    const recurringFrequencyRadio = document.querySelector('input[name="recurringFrequency"]:checked');
    const recurringFrequency = parseFloat(recurringFrequencyRadio ? recurringFrequencyRadio.value : 12) || 12;
    
    const finalBalance = document.getElementById('final-balance').textContent;
    const totalContributions = document.getElementById('total-contributions').textContent;
    const interestEarned = document.getElementById('interest-earned').textContent;
    
    // Helper function to add text with positioning
    const addText = (text, x, y, options = {}) => {
        const opts = {
            fontSize: 12,
            fontStyle: 'normal',
            color: config.textColor,
            align: 'left',
            ...options
        };
        
        doc.setFontSize(opts.fontSize);
        doc.setFont('helvetica', opts.fontStyle);
        doc.setTextColor(opts.color[0], opts.color[1], opts.color[2]);
        doc.text(text, x, y, { align: opts.align });
    };
    
    // Helper function to add a section header
    const addSectionHeader = (text, y) => {
        addText(text, config.marginLeft, y, {
            fontSize: 14,
            fontStyle: 'bold',
            color: config.primaryColor // Dark blue for section headers
        });
        // Draw line under header
        doc.setDrawColor(config.primaryColor[0], config.primaryColor[1], config.primaryColor[2]); // Dark blue line
        doc.setLineWidth(0.5);
        doc.line(config.marginLeft, y + 2, 210 - config.marginRight, y + 2);
        return y + config.sectionHeaderSpacing; // More space after header
    };
    
    // Header
    addText('Investment Calculator Report', config.marginLeft, currentY, {
        fontSize: config.headerFontSize,
        fontStyle: 'bold',
        color: [0, 0, 0] // Black
    });
    currentY += config.headerSpacing;
    
    addText('Opessocius', config.marginLeft, currentY, {
        fontSize: 14,
        fontStyle: 'normal',
        color: [0, 0, 0] // Black
    });
    currentY += 5;
    
    addText(`Generated: ${new Date().toLocaleDateString()}`, config.marginLeft, currentY, {
        fontSize: 10,
        fontStyle: 'normal',
        color: [0, 0, 0] // Black
    });
    currentY += config.sectionSpacing;
    
    // Investment Details Section
    currentY = addSectionHeader('INVESTMENT DETAILS', currentY);
    
    const details = [
        ['Initial Investment:', formatCurrency(initialInvestment)],
        ['Years of Investment:', years.toString()],
        ['Estimated Rate of Return:', `${rateOfReturn}% ${rateOfReturn === 2 ? '(Without Risk)' : '(With Risk)'}`],
        ['Recurring Investment Amount:', formatCurrency(recurringAmount)],
        ['Recurring Frequency:', recurringFrequency === 12 ? 'Monthly' : recurringFrequency === 4 ? 'Quarterly' : 'Yearly'],
        ['Compound Frequency:', 'Monthly']
    ];
    
    details.forEach(([label, value]) => {
        addText(label, config.marginLeft, currentY, { fontSize: 11, color: [0, 0, 0] });
        addText(value, config.marginLeft + 80, currentY, { fontSize: 11, fontStyle: 'bold', color: [0, 0, 0] });
        currentY += config.lineHeight;
    });
    
    currentY += config.sectionSpacing;
    
    // Disclosure & Limitations Section (before Results)
    currentY = addSectionHeader('DISCLOSURE & LIMITATIONS', currentY);
    
    const disclosureText = 'Information presented here is for general evaluation only and may not reflect individual objectives, constraints, or risk tolerance. The outputs do not incorporate fees, taxes, or operational costs that would reduce net results.\n\nAccess to protected disclosures, detailed methodologies, and underlying datasets is provided to investors through their secure portal. These documents outline assumptions, calculation mechanics, and risk considerations in full.\n\nUse of the calculator is at your discretion. Actual results may differ materially from estimates. Past performance or historical modeling does not predict future outcomes.';
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black
    const splitDisclosure = doc.splitTextToSize(disclosureText, 170);
    doc.text(splitDisclosure, config.marginLeft, currentY, { align: 'left' }); // Left align
    currentY += (splitDisclosure.length * 4.5) + config.sectionSpacing;
    
    // Results Section
    currentY = addSectionHeader('RESULTS', currentY);
    
    // Results in a box
    const resultsBoxY = currentY;
    const resultsBoxHeight = 25;
    doc.setDrawColor(0, 0, 0); // Black border
    doc.setFillColor(255, 255, 255); // White background
    doc.roundedRect(config.marginLeft, currentY - 5, 170, resultsBoxHeight, 3, 3, 'FD');
    
    addText('Final Balance:', config.marginLeft + 5, currentY + 3, { fontSize: 11, fontStyle: 'bold', color: [0, 0, 0] });
    addText(finalBalance, config.marginLeft + 50, currentY + 3, { fontSize: 14, fontStyle: 'bold', color: [0, 0, 0] });
    
    currentY += 8;
    addText('Total Contributions:', config.marginLeft + 5, currentY + 3, { fontSize: 11, color: [0, 0, 0] });
    addText(totalContributions, config.marginLeft + 50, currentY + 3, { fontSize: 11, fontStyle: 'bold', color: [0, 0, 0] });
    
    currentY += 6;
    addText('Interest Earned:', config.marginLeft + 5, currentY + 3, { fontSize: 11, color: [0, 0, 0] });
    addText(interestEarned, config.marginLeft + 50, currentY + 3, { fontSize: 11, fontStyle: 'bold', color: [0, 0, 0] });
    
    currentY += resultsBoxHeight + config.sectionSpacing;
    
    // Chart Section - Always start on new page
    const canvas = document.getElementById('growth-chart');
    if (canvas) {
        doc.addPage();
        currentY = config.marginTop;
        currentY = addSectionHeader('INVESTMENT GROWTH CHART', currentY);
        
        // Convert canvas to image
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = 170; // mm
        const imgHeight = (canvas.height / canvas.width) * imgWidth;
        
        // Check if chart fits on current page
        if (currentY + imgHeight > 280) {
            doc.addPage();
            currentY = config.marginTop;
        }
        
        doc.addImage(imgData, 'PNG', config.marginLeft, currentY, imgWidth, imgHeight);
        currentY += imgHeight + config.sectionSpacing;
    }
    
    // Yearly Breakdown Section - Continue on same page as chart
    if (window.fullYearlyBalanceData && window.fullYearlyBalanceData.length > 0) {
        // Check if we need a new page (only if chart took up too much space)
        if (currentY > 250) {
            doc.addPage();
            currentY = config.marginTop;
        } else {
            currentY += config.sectionSpacing;
        }
        currentY = addSectionHeader('YEARLY BREAKDOWN', currentY);
        
        // Table header
        const tableStartY = currentY;
        doc.setFillColor(0, 0, 0); // Black header
        doc.roundedRect(config.marginLeft, currentY - 5, 170, 8, 2, 2, 'F');
        
        addText('Year', config.marginLeft + 5, currentY, { fontSize: 11, fontStyle: 'bold', color: [255, 255, 255] });
        addText('Ending Balance', config.marginLeft + 100, currentY, { fontSize: 11, fontStyle: 'bold', color: [255, 255, 255] });
        currentY += 8;
        
        // Table rows
        window.fullYearlyBalanceData.forEach((point, index) => {
            // Check if we need a new page
            if (currentY > 280) {
                doc.addPage();
                currentY = config.marginTop;
            }
            
            const yearLabel = Math.round(point.year) === 0 ? 'Now' : `Year ${Math.round(point.year)}`;
            const bgColor = index % 2 === 0 ? [249, 250, 251] : [255, 255, 255];
            
            doc.setFillColor(bgColor[0], bgColor[1], bgColor[2]);
            doc.rect(config.marginLeft, currentY - 5, 170, 7, 'F');
            
            doc.setDrawColor(config.lightGray[0], config.lightGray[1], config.lightGray[2]);
            doc.line(config.marginLeft, currentY - 5, config.marginLeft + 170, currentY - 5);
            
            addText(yearLabel, config.marginLeft + 5, currentY, { fontSize: 10, color: [0, 0, 0] });
            addText(formatCurrency(point.balance), config.marginLeft + 100, currentY, { fontSize: 10, fontStyle: 'bold', color: [0, 0, 0] });
            currentY += 7;
        });
    }
    
    // Assumptions Section - Always start on new page
    doc.addPage();
    currentY = config.marginTop;
    currentY = addSectionHeader('ASSUMPTIONS', currentY);
    
    const assumptionsText = 'All projections are based on tax-deferred growth and apply monthly compounding for recurring contributions. Returns are shown on a gross basis unless otherwise stated.';
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black
    const splitAssumptions = doc.splitTextToSize(assumptionsText, 170);
    doc.text(splitAssumptions, config.marginLeft, currentY, { align: 'left' }); // Left align
    currentY += (splitAssumptions.length * 4.5) + config.sectionSpacing;
    
    // Disclaimer Section - Continue on same page as Assumptions
    // Check if we need a new page (only if Assumptions took up too much space)
    if (currentY > 200) {
        doc.addPage();
        currentY = config.marginTop;
    } else {
        currentY += config.sectionSpacing;
    }
    currentY = addSectionHeader('DISCLAIMER', currentY);
    
    const disclaimerText = 'The materials, projections, charts, and calculations presented herein are strictly for informational and educational purposes. They are generic in nature, do not account for your specific objectives, financial circumstances, investment horizon, or risk profile, and must not be relied upon as the basis for any financial or investment decision.\n\nNo representation or warranty, express or implied, is made regarding the accuracy, completeness, or reliability of the assumptions used or the results generated. All figures are indicative and subject to substantial variation due to market volatility, liquidity conditions, geopolitical events, interest-rate movements, operational costs, and other external factors beyond any party\'s control.\n\nNothing contained in this calculator or its outputs constitutes, or should be construed as, investment advice, a solicitation, an offer, or a recommendation to buy or sell any security, asset, derivative, or financial instrument. Independent professional advice—financial, legal, tax, and accounting—should be obtained prior to acting on any information provided.\n\nThe projections may not incorporate advisory fees, management charges, brokerage commissions, slippage, or other transaction-related expenses that could materially alter performance outcomes. Any estimates of return should be interpreted as hypothetical scenarios, not guarantees or promised results.\n\nAll investments involve risk, including the possible loss of capital. Past performance, historical models, or simulated backtests do not guarantee future returns. Market conditions can change rapidly and without notice. Use of this calculator is at your sole discretion and responsibility.';
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0); // Black
    const splitText = doc.splitTextToSize(disclaimerText, 170);
    doc.text(splitText, config.marginLeft, currentY, { align: 'left' }); // Left align instead of justify
    
    // Save PDF
    doc.save(`investment-calculator-report-${new Date().toISOString().split('T')[0]}.pdf`);
}

function drawGrowthChartFull(canvas, data, simpleData, years) {
    if (!canvas) return;

    // Make canvas responsive
    const container = canvas.parentElement;
    const containerWidth = container.clientWidth - 64;
    const aspectRatio = 1200 / 600;
    canvas.width = containerWidth;
    canvas.height = containerWidth / aspectRatio;
    canvas.style.width = containerWidth + 'px';
    canvas.style.height = (containerWidth / aspectRatio) + 'px';

    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const padding = { top: 60, right: 60, bottom: 80, left: 80 };

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Find max balance for scaling
    const maxBalance = Math.max(
        ...data.map(d => d.balance),
        ...simpleData.map(d => d.balance)
    );
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Precompute compound data point positions for tooltip usage
    const pointPositions = data.map((point, index) => {
        const x = padding.left + (index / (Math.max(data.length - 1, 1))) * chartWidth;
        const y = padding.top + chartHeight - ((point.balance / maxBalance) * chartHeight);
        return {
            x,
            y,
            balance: point.balance,
            label: point.year === 0 ? 'Now' : `Year ${Math.round(point.year)}`
        };
    });
    window.fullChartPoints = pointPositions;

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
        const y = padding.top + (chartHeight / gridLines) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(width - padding.right, y);
        ctx.stroke();
    }

    const lastX = padding.left + chartWidth;
    const lastY = padding.top + chartHeight;
    const firstX = padding.left;
    const firstY = padding.top + chartHeight;

    // Draw simple interest reference line (grey, no fill)
    ctx.save();
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    simpleData.forEach((point, index) => {
        const x = padding.left + (index / (simpleData.length - 1)) * chartWidth;
        const y = padding.top + chartHeight - ((point.balance / maxBalance) * chartHeight);
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();
    ctx.restore();

    // Draw compound interest line (blue) with shaded area
    ctx.strokeStyle = '#1e40af';
    ctx.lineWidth = 4;
    ctx.fillStyle = 'rgba(30, 64, 175, 0.1)';
    
    ctx.beginPath();
    pointPositions.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    
    ctx.lineTo(lastX, lastY);
    ctx.lineTo(firstX, firstY);
    ctx.closePath();
    ctx.fill();
    
    ctx.beginPath();
    pointPositions.forEach((point, index) => {
        if (index === 0) {
            ctx.moveTo(point.x, point.y);
        } else {
            ctx.lineTo(point.x, point.y);
        }
    });
    ctx.stroke();
    
    // Draw data points for compound interest
    ctx.fillStyle = '#1e40af';
    pointPositions.forEach((point) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 5, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw axes labels
    ctx.fillStyle = '#6b7280';
    ctx.font = '14px Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // X-axis labels
    const labelInterval = Math.max(1, Math.floor(data.length / 5));
    data.forEach((point, index) => {
        if (index % labelInterval === 0 || index === data.length - 1) {
            const x = padding.left + (index / (Math.max(data.length - 1, 1))) * chartWidth;
            const label = point.year === 0 ? 'Now' : Math.round(point.year).toString();
            ctx.fillText(label, x, height - padding.bottom + 15);
        }
    });

    // Y-axis labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    for (let i = 0; i <= gridLines; i++) {
        const value = maxBalance * (1 - i / gridLines);
        const y = padding.top + (chartHeight / gridLines) * i;
        const label = formatCurrency(value);
        ctx.fillText(label, padding.left - 15, y);
    }
}

function attachFullChartTooltip(canvas) {
    if (!canvas || canvas._tooltipAttached) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    
    const tooltip = document.createElement('div');
    tooltip.className = 'chart-tooltip';
    parent.appendChild(tooltip);
    
    const handleMouseMove = (event) => {
        const points = window.fullChartPoints || [];
        if (!points.length) {
            tooltip.style.display = 'none';
            return;
        }
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const canvasX = (event.clientX - rect.left) * scaleX;
        const canvasY = (event.clientY - rect.top) * scaleY;
        
        let closestPoint = null;
        let minDistance = Infinity;
        points.forEach(point => {
            const dx = canvasX - point.x;
            const dy = canvasY - point.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < minDistance) {
                minDistance = distance;
                closestPoint = point;
            }
        });
        
        const threshold = 25;
        if (closestPoint && minDistance <= threshold) {
            tooltip.style.display = 'block';
            tooltip.textContent = `${closestPoint.label}: ${formatCurrency(closestPoint.balance)}`;
            
            const parentRect = parent.getBoundingClientRect();
            tooltip.style.left = `${event.clientX - parentRect.left}px`;
            tooltip.style.top = `${event.clientY - parentRect.top - 12}px`;
        } else {
            tooltip.style.display = 'none';
        }
    };
    
    const handleMouseLeave = () => {
        tooltip.style.display = 'none';
    };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    
    canvas._tooltipAttached = true;
    canvas._tooltipEl = tooltip;
}

// Accordion functionality for "How We're Organized" section
document.addEventListener('DOMContentLoaded', function() {
    const accordionItems = document.querySelectorAll('.accordion-item');
    
    accordionItems.forEach(item => {
        const header = item.querySelector('.accordion-header');
        const content = item.querySelector('.accordion-content');
        
        if (header && content) {
            header.addEventListener('click', function() {
                const isActive = item.classList.contains('active');
                
                // Close all accordion items
                accordionItems.forEach(accItem => {
                    accItem.classList.remove('active');
                });
                
                // Open clicked item if it wasn't active
                if (!isActive) {
                    item.classList.add('active');
                }
            });
        }
    });
    
    // Pricing billing toggle functionality
    const billingRadios = document.querySelectorAll('input[name="billing"]');
    if (billingRadios.length > 0) {
        billingRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                const isAnnually = this.value === 'annually';
                const monthlyPrices = document.querySelectorAll('.monthly-price');
                const annuallyPrices = document.querySelectorAll('.annually-price');
                const originalPrices = document.querySelectorAll('.price-original-small');
                
                monthlyPrices.forEach(price => {
                    price.style.display = isAnnually ? 'none' : 'inline';
                });
                
                annuallyPrices.forEach(price => {
                    price.style.display = isAnnually ? 'inline' : 'none';
                });
                
                // Show original price only for annually (discount applies)
                originalPrices.forEach(price => {
                    price.style.display = isAnnually ? 'inline' : 'none';
                });
            });
        });
        
        // Initialize on page load
        const checkedRadio = document.querySelector('input[name="billing"]:checked');
        if (checkedRadio) {
            checkedRadio.dispatchEvent(new Event('change'));
        }
    }
    
    // Crude Oil Tabs functionality - scroll to sections
    const crudeTabs = document.querySelectorAll('.crude-tab');
    
    if (crudeTabs.length > 0) {
        crudeTabs.forEach(tab => {
            tab.addEventListener('click', function() {
                const targetSectionId = this.getAttribute('data-scroll');
                
                // Remove active class from all tabs
                crudeTabs.forEach(t => t.classList.remove('active'));
                
                // Add active class to clicked tab
                this.classList.add('active');
                
                // Scroll to target section
                const targetSection = document.getElementById(targetSectionId);
                if (targetSection) {
                    targetSection.scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
        
        // Update active tab based on scroll position
        const contentSections = document.querySelectorAll('.content-section');
        const updateActiveTab = () => {
            const scrollPosition = window.scrollY + 150;
            
            contentSections.forEach((section, index) => {
                const sectionTop = section.offsetTop;
                const sectionBottom = sectionTop + section.offsetHeight;
                
                if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                    const sectionId = section.getAttribute('id');
                    crudeTabs.forEach(tab => {
                        if (tab.getAttribute('data-scroll') === sectionId) {
                            crudeTabs.forEach(t => t.classList.remove('active'));
                            tab.classList.add('active');
                        }
                    });
                }
            });
        };
        
        window.addEventListener('scroll', updateActiveTab);
        updateActiveTab(); // Initial check
    }
    
    // Historical Chart for Profitability section
    const historicalChart = document.getElementById('historical-chart');
    if (historicalChart) {
        // Set canvas size based on container
        const container = historicalChart.parentElement;
        historicalChart.width = container.clientWidth - 64;
        historicalChart.height = 400;
        
        const ctx = historicalChart.getContext('2d');
        const width = historicalChart.width;
        const height = historicalChart.height;
        const padding = { top: 40, right: 40, bottom: 60, left: 80 };
        
        // Sample data points (matching the trend described)
        const dataPoints = [
            { date: '01/2020', value: 5000 },
            { date: '03/2020', value: 4500 },
            { date: '06/2020', value: 4700 },
            { date: '09/2020', value: 4800 },
            { date: '12/2020', value: 4900 },
            { date: '03/2021', value: 5000 },
            { date: '06/2021', value: 5050 },
            { date: '09/2021', value: 5100 },
            { date: '12/2021', value: 5100 },
            { date: '03/2022', value: 4800 },
            { date: '06/2022', value: 4500 },
            { date: '09/2022', value: 4200 },
            { date: '12/2022', value: 4100 },
            { date: '03/2023', value: 4300 },
            { date: '06/2023', value: 4500 },
            { date: '09/2023', value: 4700 },
            { date: '12/2023', value: 4800 },
            { date: '03/2024', value: 4900 },
            { date: '06/2024', value: 4950 },
            { date: '09/2024', value: 5000 },
            { date: '11/2025', value: 5050 }
        ];
        
        function drawChart() {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            const chartWidth = width - padding.left - padding.right;
            const chartHeight = height - padding.top - padding.bottom;
            
            // Find min and max values
            const values = dataPoints.map(d => d.value);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const valueRange = maxValue - minValue;
            const paddingValue = valueRange * 0.1;
            
            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            const gridLines = 5;
            for (let i = 0; i <= gridLines; i++) {
                const y = padding.top + (chartHeight / gridLines) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
            }
            
            // Draw axes
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            // X-axis
            ctx.beginPath();
            ctx.moveTo(padding.left, height - padding.bottom);
            ctx.lineTo(width - padding.right, height - padding.bottom);
            ctx.stroke();
            // Y-axis
            ctx.beginPath();
            ctx.moveTo(padding.left, padding.top);
            ctx.lineTo(padding.left, height - padding.bottom);
            ctx.stroke();
            
            // Draw line
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            
            dataPoints.forEach((point, index) => {
                const x = padding.left + (index / (dataPoints.length - 1)) * chartWidth;
                const normalizedValue = (point.value - minValue + paddingValue) / (valueRange + paddingValue * 2);
                const y = padding.top + chartHeight - (normalizedValue * chartHeight);
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            
            // Draw data points
            ctx.fillStyle = '#ffffff';
            dataPoints.forEach((point, index) => {
                const x = padding.left + (index / (dataPoints.length - 1)) * chartWidth;
                const normalizedValue = (point.value - minValue + paddingValue) / (valueRange + paddingValue * 2);
                const y = padding.top + chartHeight - (normalizedValue * chartHeight);
                
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw labels
            ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
            ctx.font = '12px Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            // X-axis labels (show every 3rd label)
            dataPoints.forEach((point, index) => {
                if (index % 3 === 0 || index === dataPoints.length - 1) {
                    const x = padding.left + (index / (dataPoints.length - 1)) * chartWidth;
                    ctx.fillText(point.date, x, height - padding.bottom + 10);
                }
            });
            
            // Y-axis labels
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            for (let i = 0; i <= gridLines; i++) {
                const value = maxValue + paddingValue - ((maxValue - minValue + paddingValue * 2) / gridLines) * i;
                const y = padding.top + (chartHeight / gridLines) * i;
                ctx.fillText(Math.round(value).toLocaleString(), padding.left - 10, y);
            }
            
            // Chart title
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = '14px Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText('Historical Net Asset Value', padding.left, padding.top - 25);
        }
        
        // Initial draw
        drawChart();
        
        // Redraw on window resize
        window.addEventListener('resize', function() {
            const container = historicalChart.parentElement;
            historicalChart.width = container.clientWidth - 64;
            historicalChart.height = 400;
            drawChart();
        });
    }
    
    // Assignments Donut Chart
    const assignmentsChart = document.getElementById('assignments-chart');
    if (assignmentsChart) {
        const ctx = assignmentsChart.getContext('2d');
        
        // Data for the chart
        const positions = [
            { name: 'WTI Dec 2025', value: 2.21, color: '#1e40af' },
            { name: 'Brent Dec 2025', value: 1.8, color: '#3b82f6' },
            { name: 'WTI Jan 2026', value: 1.7, color: '#8b5cf6' },
            { name: 'Brent Jan 2026', value: 1.5, color: '#06b6d4' },
            { name: 'WTI Feb 2026', value: 1.5, color: '#f97316' },
            { name: 'Brent Feb 2026', value: 1.21, color: '#7c3aed' },
            { name: 'WTI Mar 2026', value: 1.2, color: '#ef4444' },
            { name: 'Brent Mar 2026', value: 1.19, color: '#eab308' },
            { name: 'WTI Apr 2026', value: 1.19, color: '#92400e' },
            { name: 'Brent Apr 2026', value: 1.17, color: '#84cc16' }
        ];
        const othersValue = 85.33;
        
        function drawDonutChart() {
            // Set canvas size
            const container = assignmentsChart.parentElement;
            const size = Math.min(container.clientWidth, 400);
            assignmentsChart.width = size;
            assignmentsChart.height = size;
            
            const centerX = assignmentsChart.width / 2;
            const centerY = assignmentsChart.height / 2;
            const radius = assignmentsChart.width * 0.3;
            const innerRadius = assignmentsChart.width * 0.2;
            
            // Clear canvas
            ctx.clearRect(0, 0, assignmentsChart.width, assignmentsChart.height);
            
            let currentAngle = -Math.PI / 2; // Start at top
            const totalAngle = Math.PI * 2;
            
            // Draw "Others" segment (large grey segment)
            const othersAngle = (othersValue / 100) * totalAngle;
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + othersAngle);
            ctx.arc(centerX, centerY, innerRadius, currentAngle + othersAngle, currentAngle, true);
            ctx.closePath();
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.fill();
            currentAngle += othersAngle;
            
            // Draw each position segment
            positions.forEach(position => {
                const segmentAngle = (position.value / 100) * totalAngle;
                ctx.beginPath();
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + segmentAngle);
                ctx.arc(centerX, centerY, innerRadius, currentAngle + segmentAngle, currentAngle, true);
                ctx.closePath();
                ctx.fillStyle = position.color;
                ctx.fill();
                currentAngle += segmentAngle;
            });
        }
        
        // Initial draw
        drawDonutChart();
        
        // Redraw on window resize
        window.addEventListener('resize', drawDonutChart);
    }
    
    // Show more button functionality
    const showMoreBtn = document.getElementById('objective-show-more');
    const objectiveText = document.getElementById('objective-text');
    
    if (showMoreBtn && objectiveText) {
        // Initially collapse the text
        objectiveText.classList.add('collapsed');
        
        showMoreBtn.addEventListener('click', function() {
            const isExpanded = this.classList.contains('expanded');
            
            if (isExpanded) {
                // Collapse
                objectiveText.classList.add('collapsed');
                this.classList.remove('expanded');
                this.querySelector('span:first-child').textContent = 'Show more';
            } else {
                // Expand
                objectiveText.classList.remove('collapsed');
                this.classList.add('expanded');
                this.querySelector('span:first-child').textContent = 'Show less';
            }
        });
    }
    
    // Documents section - Select all functionality
    const selectAllCheckbox = document.getElementById('select-all-documents');
    const documentCheckboxes = document.querySelectorAll('.document-checkbox:not(#select-all-documents)');
    const downloadBtn = document.querySelector('.download-btn');
    
    if (selectAllCheckbox && documentCheckboxes.length > 0) {
        // Select all checkbox handler
        selectAllCheckbox.addEventListener('change', function() {
            documentCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
        });
        
        // Individual checkbox handlers
        documentCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', function() {
                const allChecked = Array.from(documentCheckboxes).every(cb => cb.checked);
                selectAllCheckbox.checked = allChecked;
            });
        });
        
        // Download button handler
        if (downloadBtn) {
            downloadBtn.addEventListener('click', function() {
                const selectedDocuments = Array.from(documentCheckboxes)
                    .filter(cb => cb.checked)
                    .map(cb => cb.getAttribute('data-document'));
                
                if (selectedDocuments.length === 0) {
                    alert('Please select at least one document to download.');
                    return;
                }
                
                // Here you would implement the actual download functionality
                console.log('Downloading documents:', selectedDocuments);
                alert(`Downloading ${selectedDocuments.length} document(s)...`);
            });
        }
    }

    // Portfolio Models Selection Functionality
    const portfolioOptionCards = document.querySelectorAll('.portfolio-option-card');
    const portfolioResult = document.getElementById('portfolio-result');
    
    // Chart animation function
    function animateChart(canvasId, valueDisplayId, monthlyGrowth, initialValue) {
        const canvas = document.getElementById(canvasId);
        const valueDisplay = document.getElementById(valueDisplayId);
        if (!canvas || !valueDisplay) return;
        
        const ctx = canvas.getContext('2d');
        const container = canvas.parentElement;
        const width = container.clientWidth - 48; // Account for padding
        const height = container.clientHeight - 48;
        
        canvas.width = width;
        canvas.height = height;
        
        const months = 60; // 5 years
        const padding = { top: 20, right: 20, bottom: 40, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;
        
        // Calculate data points
        const dataPoints = [];
        let currentValue = initialValue;
        for (let i = 0; i <= months; i++) {
            dataPoints.push({
                month: i,
                value: currentValue
            });
            if (i < months) {
                currentValue = currentValue * (1 + monthlyGrowth / 100);
            }
        }
        
        const maxValue = Math.max(...dataPoints.map(d => d.value));
        const minValue = Math.min(...dataPoints.map(d => d.value));
        const valueRange = maxValue - minValue;
        
        // Animation variables
        let progress = 0;
        const duration = 6000; // 6 seconds for smoother animation
        const startTime = Date.now();
        
        function draw() {
            // Clear canvas
            ctx.clearRect(0, 0, width, height);
            
            // Calculate current progress
            const elapsed = Date.now() - startTime;
            progress = Math.min(elapsed / duration, 1);
            // Smoother easing: ease-in-out cubic
            const easedProgress = progress < 0.5 
                ? 4 * progress * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 3) / 2;
            
            const currentMonth = Math.floor(easedProgress * months);
            const currentValue = dataPoints[currentMonth]?.value || initialValue;
            
            // Update value display
            valueDisplay.textContent = `€${currentValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
            
            // Draw grid lines
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const y = padding.top + (chartHeight / 5) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(padding.left + chartWidth, y);
                ctx.stroke();
            }
            
            // Draw axes
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 1;
            // Y-axis
            ctx.beginPath();
            ctx.moveTo(padding.left, padding.top);
            ctx.lineTo(padding.left, padding.top + chartHeight);
            ctx.stroke();
            // X-axis
            ctx.beginPath();
            ctx.moveTo(padding.left, padding.top + chartHeight);
            ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
            ctx.stroke();
            
            // Draw year labels
            ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            ctx.font = '12px Segoe UI, sans-serif';
            ctx.textAlign = 'center';
            for (let year = 0; year <= 5; year++) {
                const x = padding.left + (chartWidth / 5) * year;
                ctx.fillText(`Year ${year}`, x, padding.top + chartHeight + 25);
            }
            
            // Draw area under curve
            if (currentMonth > 0) {
                const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
                if (canvasId === 'risk-chart') {
                    gradient.addColorStop(0, 'rgba(100, 150, 255, 0.3)');
                    gradient.addColorStop(1, 'rgba(100, 150, 255, 0.05)');
                } else {
                    gradient.addColorStop(0, 'rgba(107, 255, 159, 0.3)');
                    gradient.addColorStop(1, 'rgba(107, 255, 159, 0.05)');
                }
                
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.moveTo(padding.left, padding.top + chartHeight);
                
                for (let i = 0; i <= currentMonth; i++) {
                    const x = padding.left + (chartWidth / months) * i;
                    const normalizedValue = (dataPoints[i].value - minValue) / valueRange;
                    const y = padding.top + chartHeight - (normalizedValue * chartHeight);
                    ctx.lineTo(x, y);
                }
                
                ctx.lineTo(padding.left + (chartWidth / months) * currentMonth, padding.top + chartHeight);
                ctx.closePath();
                ctx.fill();
            }
            
            // Draw line
            if (currentMonth > 0) {
                ctx.strokeStyle = canvasId === 'risk-chart' ? 'rgba(100, 150, 255, 1)' : 'rgba(107, 255, 159, 1)';
                ctx.lineWidth = 3;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.beginPath();
                
                for (let i = 0; i <= currentMonth; i++) {
                    const x = padding.left + (chartWidth / months) * i;
                    const normalizedValue = (dataPoints[i].value - minValue) / valueRange;
                    const y = padding.top + chartHeight - (normalizedValue * chartHeight);
                    
                    if (i === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                
                ctx.stroke();
                
                // Draw points
                ctx.fillStyle = canvasId === 'risk-chart' ? 'rgba(100, 150, 255, 1)' : 'rgba(107, 255, 159, 1)';
                for (let i = 0; i <= currentMonth; i += 12) { // Every year
                    const x = padding.left + (chartWidth / months) * i;
                    const normalizedValue = (dataPoints[i].value - minValue) / valueRange;
                    const y = padding.top + chartHeight - (normalizedValue * chartHeight);
                    
                    ctx.beginPath();
                    ctx.arc(x, y, 4, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Draw current point
                if (currentMonth > 0) {
                    const x = padding.left + (chartWidth / months) * currentMonth;
                    const normalizedValue = (dataPoints[currentMonth].value - minValue) / valueRange;
                    const y = padding.top + chartHeight - (normalizedValue * chartHeight);
                    
                    ctx.fillStyle = '#ffffff';
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, Math.PI * 2);
                    ctx.fill();
                    
                    ctx.strokeStyle = canvasId === 'risk-chart' ? 'rgba(100, 150, 255, 1)' : 'rgba(107, 255, 159, 1)';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, Math.PI * 2);
                    ctx.stroke();
                }
            }
            
            if (progress < 1) {
                requestAnimationFrame(draw);
            }
        }
        
        draw();
    }
    
    if (portfolioOptionCards.length > 0 && portfolioResult) {
        portfolioOptionCards.forEach(card => {
            card.addEventListener('click', function() {
                // Remove active class from all cards
                portfolioOptionCards.forEach(c => c.classList.remove('active'));
                
                // Add active class to clicked card
                this.classList.add('active');
                
                // Get the option type
                const optionType = this.getAttribute('data-option');
                
                // Hide all result contents
                const allResults = portfolioResult.querySelectorAll('.result-content');
                allResults.forEach(result => {
                    result.style.display = 'none';
                });
                
                // Show the corresponding result
                const targetResult = portfolioResult.querySelector(`.${optionType}-content`);
                if (targetResult) {
                    targetResult.style.display = 'block';
                    
                    // Animate chart after a short delay
                    setTimeout(() => {
                        if (optionType === 'risk') {
                            animateChart('risk-chart', 'risk-chart-value', 4, 230000);
                        } else {
                            animateChart('non-risk-chart', 'non-risk-chart-value', 2, 230000);
                        }
                    }, 300);
                    
                    // Handle window resize for charts
                    let resizeTimeout;
                    window.addEventListener('resize', function() {
                        clearTimeout(resizeTimeout);
                        resizeTimeout = setTimeout(() => {
                            if (optionType === 'risk' && targetResult.style.display === 'block') {
                                animateChart('risk-chart', 'risk-chart-value', 4, 230000);
                            } else if (optionType === 'non-risk' && targetResult.style.display === 'block') {
                                animateChart('non-risk-chart', 'non-risk-chart-value', 2, 230000);
                            }
                        }, 250);
                    });
                    
                    // Smooth scroll to result (less aggressive)
                    setTimeout(() => {
                        const resultRect = portfolioResult.getBoundingClientRect();
                        const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
                        const targetScroll = currentScroll + resultRect.top - 100; // Only scroll 100px from top of viewport
                        
                        window.scrollTo({
                            top: targetScroll,
                            behavior: 'smooth'
                        });
                    }, 100);
                }
            });
        });
    }

    // CTA Investment Graph
    const ctaChart = document.getElementById('cta-growth-chart');
    if (ctaChart) {
        // Sample data for CTA graph (€5,000 initial, 4% monthly, 10 years, €100 monthly)
        const initialInvestment = 5000;
        const years = 10;
        const monthlyGrowthRate = 0.04; // 4% monthly
        const recurringAmount = 100;
        const totalMonths = years * 12;
        
        let balance = initialInvestment;
        let totalContributions = initialInvestment;
        let simpleBalance = initialInvestment;
        let simplePrincipal = initialInvestment;
        
        const growthData = [{ year: 0, month: 0, balance: balance }];
        const simpleGrowthData = [{ year: 0, month: 0, balance: simpleBalance }];
        
        for (let month = 1; month <= totalMonths; month++) {
            // Compound growth
            balance = balance * (1 + monthlyGrowthRate);
            if (month % 1 === 0) { // Monthly contributions
                balance += recurringAmount;
                totalContributions += recurringAmount;
            }
            
            // Simple growth
            const simpleInterestEarned = simplePrincipal * monthlyGrowthRate;
            simpleBalance += simpleInterestEarned;
            if (month % 1 === 0) {
                simplePrincipal += recurringAmount;
                simpleBalance += recurringAmount;
            }
            
            // Record yearly
            if (month % 12 === 0 || month === totalMonths) {
                const year = month / 12;
                growthData.push({ year: year, month: month, balance: balance });
                simpleGrowthData.push({ year: year, month: month, balance: simpleBalance });
            }
        }
        
        // Draw the chart
        function drawCTAGraph() {
            const container = ctaChart.parentElement;
            const containerWidth = container.clientWidth - 48;
            const aspectRatio = 600 / 300;
            ctaChart.width = containerWidth;
            ctaChart.height = containerWidth / aspectRatio;
            ctaChart.style.width = containerWidth + 'px';
            ctaChart.style.height = (containerWidth / aspectRatio) + 'px';
            
            const ctx = ctaChart.getContext('2d');
            const width = ctaChart.width;
            const height = ctaChart.height;
            const padding = { top: 40, right: 40, bottom: 60, left: 60 };
            
            ctx.clearRect(0, 0, width, height);
            
            const maxBalance = Math.max(
                ...growthData.map(d => d.balance),
                ...simpleGrowthData.map(d => d.balance)
            );
            const chartWidth = width - padding.left - padding.right;
            const chartHeight = height - padding.top - padding.bottom;
            
            // Draw grid
            ctx.strokeStyle = '#e5e7eb';
            ctx.lineWidth = 1;
            for (let i = 0; i <= 5; i++) {
                const y = padding.top + (chartHeight / 5) * i;
                ctx.beginPath();
                ctx.moveTo(padding.left, y);
                ctx.lineTo(width - padding.right, y);
                ctx.stroke();
            }
            
            const lastX = padding.left + chartWidth;
            const lastY = padding.top + chartHeight;
            const firstX = padding.left;
            const firstY = padding.top + chartHeight;
            
            // Draw simple interest line
            ctx.save();
            ctx.strokeStyle = '#9ca3af';
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.beginPath();
            simpleGrowthData.forEach((point, index) => {
                const x = padding.left + (index / (simpleGrowthData.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - ((point.balance / maxBalance) * chartHeight);
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            ctx.restore();
            
            // Draw compound interest line with area
            ctx.strokeStyle = '#1e40af';
            ctx.lineWidth = 3;
            ctx.fillStyle = 'rgba(30, 64, 175, 0.1)';
            
            ctx.beginPath();
            growthData.forEach((point, index) => {
                const x = padding.left + (index / (growthData.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - ((point.balance / maxBalance) * chartHeight);
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.lineTo(lastX, lastY);
            ctx.lineTo(firstX, firstY);
            ctx.closePath();
            ctx.fill();
            
            ctx.beginPath();
            growthData.forEach((point, index) => {
                const x = padding.left + (index / (growthData.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - ((point.balance / maxBalance) * chartHeight);
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.stroke();
            
            // Draw data points
            ctx.fillStyle = '#1e40af';
            growthData.forEach((point, index) => {
                const x = padding.left + (index / (growthData.length - 1)) * chartWidth;
                const y = padding.top + chartHeight - ((point.balance / maxBalance) * chartHeight);
                ctx.beginPath();
                ctx.arc(x, y, 4, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw axes labels
            ctx.fillStyle = '#6b7280';
            ctx.font = '12px Segoe UI, Tahoma, Geneva, Verdana, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'top';
            
            growthData.forEach((point, index) => {
                if (index % 3 === 0 || index === growthData.length - 1) {
                    const x = padding.left + (index / (growthData.length - 1)) * chartWidth;
                    const label = point.year === 0 ? 'Now' : Math.round(point.year).toString();
                    ctx.fillText(label, x, height - padding.bottom + 10);
                }
            });
            
            // Y-axis labels
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            for (let i = 0; i <= 5; i++) {
                const y = padding.top + (chartHeight / 5) * i;
                const value = maxBalance - (maxBalance / 5) * i;
                const label = formatCurrency(value);
                ctx.fillText(label, padding.left - 10, y);
            }
        }
        
        // Initial draw
        drawCTAGraph();
        
        // Redraw on resize
        let resizeTimeout;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(drawCTAGraph, 250);
        });
    }

});

// Tooltip functionality for learn.html offer-feature-info buttons
document.addEventListener('DOMContentLoaded', function() {
    const infoButtons = document.querySelectorAll('.offer-feature-info-btn');
    
    infoButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const tooltipId = this.getAttribute('data-tooltip');
            const tooltip = document.getElementById(`tooltip-${tooltipId}`);
            
            if (tooltip) {
                // Close all other tooltips
                document.querySelectorAll('.offer-feature-tooltip').forEach(t => {
                    if (t !== tooltip) {
                        t.classList.remove('active');
                    }
                });
                
                // Toggle current tooltip
                tooltip.classList.toggle('active');
            }
        });
    });
    
    // Close tooltips when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.offer-feature-info-btn') && !e.target.closest('.offer-feature-tooltip')) {
            document.querySelectorAll('.offer-feature-tooltip').forEach(tooltip => {
                tooltip.classList.remove('active');
            });
        }
    });
    
    // Handle "what we offer" button click to scroll to learn-features-section
    const whatWeOfferBtn = document.getElementById('what-we-offer-btn');
    if (whatWeOfferBtn) {
        whatWeOfferBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const targetSection = document.getElementById('learn-features-section');
            if (targetSection) {
                targetSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        });
    }
});

// Feature Side Panel functionality
document.addEventListener('DOMContentLoaded', function() {
    const sidePanel = document.getElementById('feature-side-panel');
    const sidePanelClose = document.getElementById('feature-side-panel-close');
    const learnMoreLinks = document.querySelectorAll('.tooltip-learn-more[data-feature-detail]');
    
    // Feature content data
    const featureContent = {
        fundamentals: {
            image: 'images/marketchart.jpeg',
            title: 'Market Fundamentals',
            text: '<p>Understanding market fundamentals is essential for successful energy trading. This comprehensive module covers the core principles that drive crude oil prices, including supply and demand dynamics, inventory cycles, and seasonal patterns.</p><p>You\'ll learn how to analyze production data from major oil-producing regions, understand the impact of refinery utilization rates, and interpret storage levels at key hubs like Cushing, Oklahoma. The course also covers how geopolitical events, OPEC+ decisions, and non-OPEC supply responses create fundamental shifts that affect pricing.</p><p>By mastering these fundamentals, you\'ll be able to identify when market pricing diverges from underlying supply-demand balance, creating opportunities for strategic positioning.</p>'
        },
        technical: {
            image: 'images/marketchart.jpeg',
            title: 'Technical Analysis',
            text: '<p>Master the art of chart reading and pattern recognition to make informed trading decisions. This module provides in-depth coverage of technical analysis techniques used by professional energy traders.</p><p>Learn to identify key chart patterns including head and shoulders, triangles, flags, and pennants. Understand how to use technical indicators like moving averages, RSI, MACD, and Bollinger Bands to confirm trade setups. The course covers support and resistance levels, trend lines, and volume analysis specific to energy markets.</p><p>You\'ll also learn how to combine multiple technical signals for higher-probability trades and understand the relationship between technical patterns and fundamental market events.</p>'
        },
        risk: {
            image: 'images/RiskManagement.png',
            title: 'Risk Management',
            text: '<p>Effective risk management is the cornerstone of professional trading. This module teaches you how to protect your capital while maximizing trading opportunities through systematic position sizing and risk controls.</p><p>Learn professional techniques for calculating position sizes based on account risk percentage, setting appropriate stop-loss levels, and managing drawdowns. The course covers portfolio-level risk management, correlation analysis, and how to adjust position sizes based on market volatility.</p><p>You\'ll also learn about maximum drawdown limits, risk-reward ratios, and how to maintain discipline during losing streaks. Understanding these concepts is critical for long-term trading success in volatile energy markets.</p>'
        },
        macro: {
            image: 'images/opec1.png',
            title: 'Macroeconomic Factors',
            text: '<p>Energy markets are deeply influenced by global macroeconomic conditions. This module explores how currency movements, interest rates, economic growth cycles, and central bank policies impact crude oil pricing.</p><p>Learn to analyze the relationship between the U.S. dollar and oil prices, understand how economic indicators like GDP growth and manufacturing data affect energy demand, and interpret the impact of monetary policy changes on commodity markets.</p><p>The course also covers cross-market analysis, showing you how equity markets, bond yields, and currency pairs can signal broader macroeconomic shifts that affect energy pricing. This knowledge helps you anticipate market moves before they become apparent in price action.</p>'
        },
        psychology: {
            image: 'images/stockexchange4.jpeg',
            title: 'Trading Psychology',
            text: '<p>Mental fortitude and emotional discipline are often what separate successful traders from those who struggle. This module focuses on developing the psychological resilience needed to stick to your trading plan under pressure.</p><p>Learn to recognize and manage common psychological traps like fear, greed, revenge trading, and overconfidence. The course covers techniques for maintaining emotional balance during both winning and losing streaks, dealing with drawdowns, and avoiding the temptation to deviate from your strategy.</p><p>You\'ll also learn about the importance of maintaining trading journals, setting realistic expectations, and building confidence through consistent practice. Developing strong trading psychology is essential for long-term success in volatile energy markets.</p>'
        },
        advanced: {
            image: 'images/staretgy.png',
            title: 'Advanced Trading Strategies',
            text: '<p>Take your trading to the next level with sophisticated strategies used by professional traders. This advanced module covers complex techniques including spread trading, arbitrage opportunities, and options strategies.</p><p>Learn about calendar spreads, inter-commodity spreads, and crack spreads in energy markets. Understand how to identify and exploit arbitrage opportunities between different contracts or markets. The course also covers options strategies including protective puts, covered calls, and complex multi-leg positions.</p><p>You\'ll learn how to structure trades to maximize risk-adjusted returns and understand when advanced strategies are appropriate versus simpler approaches. These techniques require a solid foundation in fundamentals and technical analysis, making them ideal for experienced traders looking to expand their toolkit.</p>'
        },
        realtime: {
            image: 'images/marketchart.jpeg',
            title: 'Real-time Market Analysis',
            text: '<p>Get live market insights and analysis from our expert team to stay ahead of price movements and trading opportunities. This service provides real-time commentary on market developments as they happen.</p><p>Receive live trade ideas, market updates, and expert analysis during active trading hours. Our team monitors market news, economic releases, and technical developments to provide timely insights that help you make informed decisions.</p><p>The real-time analysis includes explanations of why markets are moving, identification of key support and resistance levels, and alerts when significant market events occur. This hands-on learning experience helps you develop your own analytical skills while benefiting from professional insights.</p>'
        },
        mentorship: {
            image: 'images/consult.png',
            title: 'One-on-One Mentorship',
            text: '<p>Work directly with experienced traders for personalized guidance tailored to your specific goals and experience level. Our mentorship program provides individualized attention to help accelerate your learning curve.</p><p>Receive personalized feedback on your trading approach, risk management strategies, and market analysis. Your mentor will help you identify areas for improvement, develop your strengths, and work through specific challenges you\'re facing in your trading journey.</p><p>Regular one-on-one sessions provide opportunities to discuss trade setups, review past performance, and develop a personalized trading plan. This direct access to experienced professionals is invaluable for developing confidence and refining your trading skills.</p>'
        },
        live: {
            image: 'images/stockexchange4.jpeg',
            title: 'Live Trading Sessions',
            text: '<p>Watch professional traders in action during live market hours to see how strategies are applied in real-time market conditions. These sessions provide valuable insights into the decision-making process of experienced traders.</p><p>Observe how professional traders analyze market conditions, identify opportunities, and execute trades in real-time. You\'ll see how they manage positions, adjust strategies based on changing market conditions, and handle unexpected events.</p><p>The live sessions include commentary explaining the reasoning behind each trade decision, risk management considerations, and how various analytical tools are used in practice. This observational learning complements theoretical knowledge with practical experience.</p>'
        },
        certification: {
            image: 'images/TechnicalAnalysisLibrary.png',
            title: 'Certification Program',
            text: '<p>Earn a recognized certification that validates your trading expertise and demonstrates your commitment to professional development in energy markets. Our certification program provides a comprehensive assessment of your knowledge and skills.</p><p>The certification process includes rigorous evaluation of your understanding of market fundamentals, technical analysis, risk management, and trading psychology. Successfully completing the program demonstrates your proficiency across all key areas of energy trading.</p><p>Certified traders receive a credential that can enhance their professional profile and demonstrate their expertise to potential employers or trading partners. The certification is designed to be a meaningful benchmark of your trading knowledge and skills.</p>'
        }
    };
    
    // Handle "Learn more" link clicks
    learnMoreLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // Prevent any scrolling behavior
            const scrollY = window.scrollY;
            
            const featureType = this.getAttribute('data-feature-detail');
            const content = featureContent[featureType];
            
            if (content && sidePanel) {
                // Populate panel with content
                document.getElementById('feature-side-panel-image').src = content.image;
                document.getElementById('feature-side-panel-image').alt = content.title;
                document.getElementById('feature-side-panel-title').textContent = content.title;
                document.getElementById('feature-side-panel-text').innerHTML = content.text;
                
                // Prevent body scroll and maintain scroll position
                document.body.style.position = 'fixed';
                document.body.style.top = `-${scrollY}px`;
                document.body.style.width = '100%';
                
                // Show panel
                sidePanel.classList.add('active');
            }
        });
    });
    
    // Function to close panel without scrolling
    function closePanel() {
        // Get the current scroll position from the top style
        const scrollY = document.body.style.top ? Math.abs(parseInt(document.body.style.top)) : window.pageYOffset || document.documentElement.scrollTop;
        
        // Temporarily disable smooth scrolling
        const html = document.documentElement;
        const originalScrollBehavior = html.style.scrollBehavior;
        html.style.scrollBehavior = 'auto';
        
        // Remove the panel active class first (visual)
        sidePanel.classList.remove('active');
        
        // Restore body styles
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        
        // Immediately set scroll position without animation
        window.scrollTo(0, scrollY);
        html.scrollTop = scrollY;
        document.body.scrollTop = scrollY;
        
        // Restore original scroll behavior after a brief moment
        requestAnimationFrame(() => {
            html.style.scrollBehavior = originalScrollBehavior || '';
        });
    }
    
    // Handle close button
    if (sidePanelClose) {
        sidePanelClose.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closePanel();
        });
    }
    
    // Close panel when clicking overlay
    const overlay = sidePanel.querySelector('.feature-side-panel-overlay');
    if (overlay) {
        overlay.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closePanel();
        });
    }
    
    // Close panel on Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && sidePanel.classList.contains('active')) {
            closePanel();
        }
    });
});


