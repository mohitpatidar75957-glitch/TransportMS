package com.tms.backend.util;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class RegistrationNumberFormatter {

    private static final Pattern BH_PATTERN = Pattern.compile("^(\\d{2})(BH)(\\d{1,4})([A-Z]{1,2})$");
    private static final Pattern STANDARD_PATTERN = Pattern.compile("^([A-Z]{2})(\\d{1,2})([A-Z]{0,3})(\\d{1,4})$");

    /**
     * Standardizes vehicle registration numbers to standard hyphenated format:
     * Examples:
     *   "RJ14-GB-1234" -> "RJ-14-GB-1234"
     *   "rj14gb1234"   -> "RJ-14-GB-1234"
     *   "MH04AB1234"   -> "MH-04-AB-1234"
     *   "MH-04-AB-1234"-> "MH-04-AB-1234"
     *   "DL1C9999"     -> "DL-01-C-9999"
     */
    public static String format(String input) {
        if (input == null) return null;
        String raw = input.trim().toUpperCase();
        if (raw.isEmpty()) return raw;

        String clean = raw.replaceAll("[^A-Z0-9]", "");

        // 1. Check Bharat Series (e.g., 22BH1234AA)
        Matcher bhMatcher = BH_PATTERN.matcher(clean);
        if (bhMatcher.matches()) {
            String year = bhMatcher.group(1);
            String bh = bhMatcher.group(2);
            String num = String.format("%04d", Integer.parseInt(bhMatcher.group(3)));
            String series = bhMatcher.group(4);
            return year + "-" + bh + "-" + num + "-" + series;
        }

        // 2. Standard State Series (e.g., MH04AB1234, RJ14GB1234)
        Matcher stdMatcher = STANDARD_PATTERN.matcher(clean);
        if (stdMatcher.matches()) {
            String state = stdMatcher.group(1);
            String rto = stdMatcher.group(2);
            if (rto.length() == 1) {
                rto = "0" + rto;
            }
            String series = stdMatcher.group(3);
            String num = String.format("%04d", Integer.parseInt(stdMatcher.group(4)));

            if (series != null && !series.isEmpty()) {
                return state + "-" + rto + "-" + series + "-" + num;
            } else {
                return state + "-" + rto + "-" + num;
            }
        }

        // If not strictly matching standard patterns, normalize spaces/dashes
        String[] parts = raw.split("[\\s-]+");
        if (parts.length >= 3 && parts.length <= 4) {
            return String.join("-", parts);
        }

        return raw;
    }
}
