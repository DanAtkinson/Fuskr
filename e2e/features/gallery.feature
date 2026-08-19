Feature: Gallery generation from repository media

  Scenario: Generate a gallery from a numeric image range
    Given the Fuskr extension is open
    When I generate a gallery for "https://raw.githubusercontent.com/DanAtkinson/Fuskr/master/e2e/fixtures/images/numeric/image[01-03].svg"
    Then I should see 3 gallery items

  Scenario: Generate a gallery from an alphabetic image range
    Given the Fuskr extension is open
    When I generate a gallery for "https://raw.githubusercontent.com/DanAtkinson/Fuskr/master/e2e/fixtures/images/alphabetic/image[a-c].svg"
    Then I should see 3 gallery items

  Scenario: Reuse a grouped range placeholder
    Given the Fuskr extension is open
    When I generate a gallery for "https://raw.githubusercontent.com/DanAtkinson/Fuskr/master/e2e/fixtures/images/grouped/[01-02]/{0}.svg"
    Then I should see 2 gallery items

  Scenario: Save an options preference
    Given the Fuskr options page is open
    When I enable the dark mode setting
    Then the dark mode setting should be enabled
